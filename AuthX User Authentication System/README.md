# 🔐 AuthX - User Authentication & Authorization System

A production-grade authentication and authorization service designed for web and mobile applications. AuthX provides secure user onboarding, login, role-based access control (RBAC), and complete token lifecycle management.

---

## 🚀 Quick Start (Clone & Run)

### 🍎 macOS / Linux
```bash
# 1. Clone the repository
git clone https://github.com/q225/authx.git
cd authx

# 2. Run setup script (installs everything!)
chmod +x setup.sh
./setup.sh

# 3. Start the server
npm run dev
```

### 🪟 Windows

**Option 1: PowerShell (Recommended)**
```powershell
# 1. Clone the repository
git clone https://github.com/q225/authx.git
cd authx

# 2. Run setup script
.\setup.ps1

# 3. Follow the instructions to set up PostgreSQL, then:
npm run db:push
npm run db:seed
npm run dev
```

**Option 2: Command Prompt**
```cmd
# 1. Clone the repository
git clone https://github.com/q225/authx.git
cd authx

# 2. Run setup script
setup.bat

# 3. Follow the instructions to set up PostgreSQL, then:
npm run db:push
npm run db:seed
npm run dev
```

### 📋 Windows Prerequisites

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
3. **Git**: Download from [git-scm.com](https://git-scm.com/download/win)

After installing PostgreSQL on Windows:
1. Open **pgAdmin** or **SQL Shell (psql)**
2. Create database: `CREATE DATABASE authx_db;`
3. Update `.env` file with your credentials:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/authx_db"
   ```

---

**That's it!** Server runs at `http://localhost:3001`

### Default Login
```
Email:    admin@authx.local
Password: Admin@123!
```

### Test the API
```bash
# Health check
curl http://localhost:3001/api/v1/health

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@authx.local","password":"Admin@123!"}'
```

---

## ✨ Features

- **User Authentication**
  - Secure user registration and login
  - Email/username authentication
  - Password hashing with bcrypt (configurable salt rounds)
  
- **JWT Token Management**
  - Access tokens for API authentication
  - Refresh tokens with rotation
  - Token revocation and blacklisting
  - Configurable expiration times

- **Role-Based Access Control (RBAC)**
  - Flexible role management
  - Granular permission system
  - Resource-based authorization
  - Permission inheritance

- **Session Management**
  - Multi-device session tracking
  - Session termination
  - Logout from all devices

- **Security Features**
  - Helmet.js security headers
  - CORS configuration
  - Rate limiting
  - Audit logging
  - Input validation

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT, bcryptjs
- **Security:** Helmet, CORS, express-rate-limit
- **Validation:** express-validator

## 📁 Project Structure

```
authx/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seeding
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validators/      # Request validators
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/               # Test files
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd authx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/authx_db"
   JWT_ACCESS_SECRET="your-secure-access-secret-min-32-chars"
   JWT_REFRESH_SECRET="your-secure-refresh-secret-min-32-chars"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed initial data
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/logout-all` | Logout from all devices | Yes |
| POST | `/auth/refresh` | Refresh access token | No (refresh token) |
| POST | `/auth/change-password` | Change password | Yes |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/auth/sessions` | Get active sessions | Yes |

### User Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/users` | List all users | `users:read` |
| GET | `/users/:id` | Get user by ID | Owner or `users:read` |
| PUT | `/users/:id` | Update user | Owner or `users:update` |
| PATCH | `/users/:id/status` | Update user status | `users:manage` |
| DELETE | `/users/:id` | Delete user | `users:delete` |
| POST | `/users/:id/roles` | Assign role | `users:manage` |
| DELETE | `/users/:id/roles/:roleId` | Remove role | `users:manage` |

### Role Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/roles` | List all roles | `roles:read` |
| GET | `/roles/:id` | Get role by ID | `roles:read` |
| POST | `/roles` | Create role | `roles:create` |
| PUT | `/roles/:id` | Update role | `roles:update` |
| DELETE | `/roles/:id` | Delete role | `roles:delete` |
| PUT | `/roles/:id/permissions` | Set role permissions | `roles:manage` |

### Permission Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/permissions` | List all permissions | `roles:read` |
| GET | `/permissions/grouped` | Get permissions by resource | `roles:read` |
| POST | `/permissions` | Create permission | `roles:manage` |
| DELETE | `/permissions/:id` | Delete permission | `roles:manage` |

## 🔑 Authentication Flow

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass@123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass@123"
  }'
```

### Using Access Token
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit sensitive data. Use environment variables.
2. **HTTPS**: Always use HTTPS in production.
3. **Password Requirements**: 
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character
4. **Rate Limiting**: 
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 10 requests per 15 minutes
5. **Token Security**:
   - Access tokens: Short-lived (15 minutes default)
   - Refresh tokens: Stored in HTTP-only cookies
   - Token rotation on refresh

## 🗃 Database Schema

### Users
- `id` - UUID primary key
- `email` - Unique email address
- `username` - Unique username
- `password` - Hashed password
- `firstName`, `lastName` - Optional profile fields
- `isActive` - Account status
- `isVerified` - Email verification status
- `lastLoginAt` - Last login timestamp

### Roles
- `id` - UUID primary key
- `name` - Unique role name
- `description` - Role description
- `isDefault` - Default role for new users

### Permissions
- `id` - UUID primary key
- `name` - Permission display name
- `resource` - Resource identifier (e.g., "users")
- `action` - Action type (create, read, update, delete, manage)

## 📝 Default Admin Credentials

After seeding the database:
```
Email:    admin@authx.local
Password: Admin@123!
```

⚠️ **Change these credentials immediately in production!**

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚢 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<strong-32-char-secret>
JWT_REFRESH_SECRET=<strong-32-char-secret>
CORS_ORIGIN=https://yourdomain.com
COOKIE_SECURE=true
```

### Platforms

- **Render**: Connect your repository and set environment variables
- **Railway**: Use the Railway CLI or dashboard
- **Docker**: Dockerfile available for containerized deployments

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for secure authentication
