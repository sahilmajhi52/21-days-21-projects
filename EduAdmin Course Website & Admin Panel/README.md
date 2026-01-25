# EduAdmin - Course Website & Admin Panel Backend

A comprehensive backend system for managing an online course platform with APIs for handling users, courses, lessons, enrollments, and admin-level operations.

## Features

- **User Management**: Registration, authentication, role-based access control (Admin, Instructor, Student)
- **Course Management**: Create, update, publish courses with modules and lessons
- **Enrollment System**: Student enrollment and progress tracking
- **Content Organization**: Categories, modules, lessons with support for video, articles, and resources
- **Reviews & Ratings**: Course reviews with instructor responses
- **Admin Panel APIs**: Dashboard statistics, content moderation
- **Security**: JWT authentication, rate limiting, data sanitization

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting, Express Mongo Sanitize

## Prerequisites

- Node.js 18 or higher
- MongoDB (local installation, Docker, or MongoDB Atlas)
- npm or yarn

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
cd eduadmin

# macOS/Linux
chmod +x setup.sh
./setup.sh

# Windows (Command Prompt)
setup.bat

# Windows (PowerShell)
.\setup.ps1
```

### 2. Configure Environment

Edit the `.env` file with your settings:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduadmin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Run the Application

```bash
# Seed database with test data
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

## Test Accounts

After running `npm run seed`:

| Role       | Email                      | Password       |
|------------|----------------------------|----------------|
| Admin      | admin@eduadmin.com         | Admin@123      |
| Instructor | instructor@eduadmin.com    | Instructor@123 |
| Student    | student@eduadmin.com       | Student@123    |

## API Endpoints

### Authentication
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| POST   | /api/v1/auth/register     | Register new user     |
| POST   | /api/v1/auth/login        | Login user            |
| POST   | /api/v1/auth/refresh-tokens| Refresh access token |
| POST   | /api/v1/auth/logout       | Logout user           |
| GET    | /api/v1/auth/profile      | Get current user      |
| PATCH  | /api/v1/auth/profile      | Update profile        |
| POST   | /api/v1/auth/change-password | Change password    |

### Users (Admin)
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | /api/v1/users             | Get all users         |
| POST   | /api/v1/users             | Create user           |
| GET    | /api/v1/users/:id         | Get user by ID        |
| PATCH  | /api/v1/users/:id         | Update user           |
| DELETE | /api/v1/users/:id         | Delete user           |
| GET    | /api/v1/users/statistics  | Get user stats        |

### Categories
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | /api/v1/categories        | Get all categories    |
| GET    | /api/v1/categories/tree   | Get category tree     |
| POST   | /api/v1/categories        | Create category (Admin)|
| GET    | /api/v1/categories/:id    | Get category          |
| PATCH  | /api/v1/categories/:id    | Update category (Admin)|
| DELETE | /api/v1/categories/:id    | Delete category (Admin)|

### Courses
| Method | Endpoint                           | Description              |
|--------|-------------------------------------|--------------------------|
| GET    | /api/v1/courses                     | Get all courses          |
| POST   | /api/v1/courses                     | Create course            |
| GET    | /api/v1/courses/:id                 | Get course by ID         |
| GET    | /api/v1/courses/slug/:slug          | Get course by slug       |
| PATCH  | /api/v1/courses/:id                 | Update course            |
| DELETE | /api/v1/courses/:id                 | Delete course            |
| POST   | /api/v1/courses/:id/publish         | Publish course           |
| POST   | /api/v1/courses/:id/unpublish       | Unpublish course         |
| GET    | /api/v1/courses/my-courses          | Get instructor's courses |

### Modules (Nested under Courses)
| Method | Endpoint                                    | Description       |
|--------|---------------------------------------------|-------------------|
| GET    | /api/v1/courses/:courseId/modules           | Get modules       |
| POST   | /api/v1/courses/:courseId/modules           | Create module     |
| GET    | /api/v1/courses/:courseId/modules/:id       | Get module        |
| PATCH  | /api/v1/courses/:courseId/modules/:id       | Update module     |
| DELETE | /api/v1/courses/:courseId/modules/:id       | Delete module     |
| POST   | /api/v1/courses/:courseId/modules/reorder   | Reorder modules   |

### Lessons (Nested under Modules)
| Method | Endpoint                                              | Description      |
|--------|-------------------------------------------------------|------------------|
| GET    | /api/v1/courses/:courseId/modules/:moduleId/lessons   | Get lessons      |
| POST   | /api/v1/courses/:courseId/modules/:moduleId/lessons   | Create lesson    |
| GET    | /api/v1/courses/:courseId/modules/:moduleId/lessons/:id | Get lesson     |
| PATCH  | /api/v1/courses/:courseId/modules/:moduleId/lessons/:id | Update lesson  |
| DELETE | /api/v1/courses/:courseId/modules/:moduleId/lessons/:id | Delete lesson  |

### Enrollments
| Method | Endpoint                                    | Description              |
|--------|---------------------------------------------|--------------------------|
| GET    | /api/v1/enrollments/my-enrollments          | Get my enrollments       |
| POST   | /api/v1/enrollments/courses/:courseId       | Enroll in course         |
| POST   | /api/v1/enrollments/:id/cancel              | Cancel enrollment        |
| GET    | /api/v1/enrollments                         | Get all enrollments (Admin)|

### Progress
| Method | Endpoint                                                | Description            |
|--------|---------------------------------------------------------|------------------------|
| GET    | /api/v1/enrollments/courses/:courseId/progress          | Get course progress    |
| PATCH  | /api/v1/enrollments/courses/:courseId/lessons/:id/progress | Update lesson progress|
| POST   | /api/v1/enrollments/courses/:courseId/lessons/:id/complete | Mark lesson complete |
| GET    | /api/v1/enrollments/courses/:courseId/next-lesson       | Get next lesson        |

### Reviews
| Method | Endpoint                                           | Description           |
|--------|----------------------------------------------------|-----------------------|
| GET    | /api/v1/courses/:courseId/reviews                  | Get course reviews    |
| POST   | /api/v1/courses/:courseId/reviews                  | Create review         |
| PATCH  | /api/v1/courses/:courseId/reviews/:id              | Update review         |
| DELETE | /api/v1/courses/:courseId/reviews/:id              | Delete review         |
| POST   | /api/v1/courses/:courseId/reviews/:id/respond      | Respond to review     |

### Admin
| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| GET    | /api/v1/admin/dashboard               | Get dashboard statistics |
| POST   | /api/v1/admin/reviews/:id/approve     | Approve review           |
| POST   | /api/v1/admin/reviews/:id/reject      | Reject review            |

## Project Structure

```
eduadmin/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── validations/     # Joi validation schemas
│   ├── utils/           # Utility functions
│   ├── seeds/           # Database seeders
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── uploads/             # File uploads directory
├── env.example          # Environment variables template
├── package.json         # Node.js dependencies
├── setup.sh             # macOS/Linux setup script
├── setup.bat            # Windows setup script (CMD)
├── setup.ps1            # Windows setup script (PowerShell)
└── README.md            # This file
```

## Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run seed    # Seed database with test data
npm run lint    # Run ESLint
npm run lint:fix # Fix ESLint errors
npm test        # Run tests
```

## Cross-Platform Compatibility

This project is designed to work seamlessly on both Windows and macOS/Linux:

- **Path handling**: Uses `path.join()` for all file paths
- **Environment**: Supports both `.env` and environment variables
- **Setup scripts**: Provided for both platforms
- **No OS-specific dependencies**: All dependencies are cross-platform

## License

MIT
