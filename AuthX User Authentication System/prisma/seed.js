/**
 * Database Seed Script
 * Seeds initial roles, permissions, and admin user
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PERMISSIONS = [
  // User permissions
  { name: 'View Users', resource: 'users', action: 'read', description: 'View user list and details' },
  { name: 'Create Users', resource: 'users', action: 'create', description: 'Create new users' },
  { name: 'Update Users', resource: 'users', action: 'update', description: 'Update user details' },
  { name: 'Delete Users', resource: 'users', action: 'delete', description: 'Delete users' },
  { name: 'Manage Users', resource: 'users', action: 'manage', description: 'Full user management access' },

  // Role permissions
  { name: 'View Roles', resource: 'roles', action: 'read', description: 'View roles and permissions' },
  { name: 'Create Roles', resource: 'roles', action: 'create', description: 'Create new roles' },
  { name: 'Update Roles', resource: 'roles', action: 'update', description: 'Update role details' },
  { name: 'Delete Roles', resource: 'roles', action: 'delete', description: 'Delete roles' },
  { name: 'Manage Roles', resource: 'roles', action: 'manage', description: 'Full role and permission management' },

  // Audit permissions
  { name: 'View Audit Logs', resource: 'audit', action: 'read', description: 'View audit logs' },
  { name: 'Manage Audit', resource: 'audit', action: 'manage', description: 'Full audit log access' },
];

const ROLES = [
  {
    name: 'admin',
    description: 'Full system administrator with all permissions',
    isDefault: false,
    permissions: [
      'users:read', 'users:create', 'users:update', 'users:delete', 'users:manage',
      'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'roles:manage',
      'audit:read', 'audit:manage'
    ],
  },
  {
    name: 'moderator',
    description: 'Can manage users but not roles',
    isDefault: false,
    permissions: ['users:read', 'users:update', 'roles:read', 'audit:read'],
  },
  {
    name: 'user',
    description: 'Regular user with basic permissions',
    isDefault: true,
    permissions: [],
  },
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create permissions
  console.log('Creating permissions...');
  const createdPermissions = {};

  for (const perm of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {
        name: perm.name,
        description: perm.description,
      },
      create: {
        name: perm.name,
        description: perm.description,
        resource: perm.resource,
        action: perm.action,
      },
    });
    createdPermissions[`${perm.resource}:${perm.action}`] = permission.id;
    console.log(`  ✓ ${perm.name}`);
  }

  // Create roles
  console.log('\nCreating roles...');

  for (const roleData of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description,
        isDefault: roleData.isDefault,
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        isDefault: roleData.isDefault,
      },
    });

    // Assign permissions to role
    for (const permKey of roleData.permissions) {
      const permissionId = createdPermissions[permKey];
      if (permissionId) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId,
          },
        });
      }
    }

    console.log(`  ✓ ${roleData.name} (${roleData.permissions.length} permissions)`);
  }

  // Create admin user
  console.log('\nCreating admin user...');

  const adminPassword = await bcrypt.hash('Admin@123!', 12);
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@authx.local' },
    update: {},
    create: {
      email: 'admin@authx.local',
      username: 'admin',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
      isVerified: true,
    },
  });

  // Assign admin role
  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }

  console.log('  ✓ Admin user created');
  console.log('\n════════════════════════════════════════');
  console.log('  Admin Credentials:');
  console.log('  Email:    admin@authx.local');
  console.log('  Password: Admin@123!');
  console.log('════════════════════════════════════════\n');

  console.log('✅ Database seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
