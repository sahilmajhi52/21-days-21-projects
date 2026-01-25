const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { User, Wallet, Transaction } = require('../models');
const config = require('../config');

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoose.url);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Wallet.deleteMany({}),
      Transaction.deleteMany({}),
    ]);

    // Create test users
    console.log('Creating users...');

    const user1 = await User.create({
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul@gfgpay.com',
      phoneNumber: '9876543210',
      password: 'Test@123',
      pin: '1234',
      isVerified: true,
      kycStatus: 'verified',
    });

    const user2 = await User.create({
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya@gfgpay.com',
      phoneNumber: '9876543211',
      password: 'Test@123',
      pin: '1234',
      isVerified: true,
      kycStatus: 'verified',
    });

    const user3 = await User.create({
      firstName: 'Amit',
      lastName: 'Kumar',
      email: 'amit@gfgpay.com',
      phoneNumber: '9876543212',
      password: 'Test@123',
      isVerified: true,
      kycStatus: 'pending',
    });

    // Create wallets with initial balance
    console.log('Creating wallets...');

    await Wallet.create({
      user: user1._id,
      balance: 10000,
      totalReceived: 10000,
    });

    await Wallet.create({
      user: user2._id,
      balance: 5000,
      totalReceived: 5000,
    });

    await Wallet.create({
      user: user3._id,
      balance: 1000,
      totalReceived: 1000,
    });

    console.log('\n✅ Seed data created successfully!\n');
    console.log('📱 Test Accounts:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('User 1:');
    console.log(`  Phone: 9876543210  |  Password: Test@123  |  PIN: 1234`);
    console.log(`  UPI ID: ${user1.upiId}  |  Balance: ₹10,000`);
    console.log('');
    console.log('User 2:');
    console.log(`  Phone: 9876543211  |  Password: Test@123  |  PIN: 1234`);
    console.log(`  UPI ID: ${user2.upiId}  |  Balance: ₹5,000`);
    console.log('');
    console.log('User 3 (No PIN set):');
    console.log(`  Phone: 9876543212  |  Password: Test@123`);
    console.log(`  UPI ID: ${user3.upiId}  |  Balance: ₹1,000`);
    console.log('─────────────────────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
