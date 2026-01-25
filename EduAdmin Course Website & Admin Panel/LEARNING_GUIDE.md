# EduAdmin - Learning Guide for Students

This guide explains the complete architecture and flow of the EduAdmin backend system step by step.

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Request-Response Flow](#2-request-response-flow)
3. [Layer-by-Layer Explanation](#3-layer-by-layer-explanation)
4. [Authentication Flow](#4-authentication-flow)
5. [Course Management Flow](#5-course-management-flow)
6. [Enrollment & Progress Flow](#6-enrollment--progress-flow)
7. [Database Schema Relationships](#7-database-schema-relationships)
8. [Best Practices Used](#8-best-practices-used)

---

## 1. Project Architecture Overview

EduAdmin follows a **layered architecture** pattern that separates concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                          │
│                    (Postman, Frontend, curl)                    │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                           EXPRESS APP                           │
│                         (src/app.js)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware Chain:                                        │  │
│  │  1. helmet() - Security headers                           │  │
│  │  2. cors() - Cross-origin requests                        │  │
│  │  3. morgan() - Request logging                            │  │
│  │  4. express.json() - Parse JSON body                      │  │
│  │  5. mongoSanitize() - Prevent NoSQL injection             │  │
│  │  6. rateLimiter - Prevent abuse                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                            ROUTES                               │
│                      (src/routes/*.js)                          │
│         Define URL endpoints and connect to controllers         │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          MIDDLEWARE                             │
│                    (src/middleware/*.js)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  authenticate  │  │    validate    │  │   isAdmin, etc   │  │
│  │  (JWT check)   │  │  (Joi schema)  │  │  (Role check)    │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CONTROLLERS                             │
│                   (src/controllers/*.js)                        │
│            Handle HTTP request/response logic                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SERVICES                               │
│                    (src/services/*.js)                          │
│              Business logic and data operations                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                           MODELS                                │
│                     (src/models/*.js)                           │
│           Mongoose schemas and database operations              │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          MONGODB                                │
│                        (Database)                               │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure Explained

```
src/
├── config/           # Configuration (database, environment variables)
├── controllers/      # Handle HTTP requests, call services, send responses
├── middleware/       # Request processing (auth, validation, errors)
├── models/           # Database schemas (User, Course, Lesson, etc.)
├── routes/           # URL endpoints mapping
├── services/         # Business logic (the "brain" of the app)
├── validations/      # Input validation schemas (Joi)
├── utils/            # Helper functions (ApiError, pagination, etc.)
├── seeds/            # Database seeding scripts
├── app.js            # Express app configuration
└── server.js         # Server entry point
```

---

## 2. Request-Response Flow

Let's trace a request through the entire system:

### Example: GET /api/v1/courses

```
┌────────────────────────────────────────────────────────────────────────┐
│ Step 1: Client sends GET request to /api/v1/courses                   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 2: Express app.js receives request                               │
│         - Applies security middleware (helmet, cors)                  │
│         - Parses JSON body                                            │
│         - Sanitizes input                                             │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 3: Router matches /api/v1/courses to course.routes.js            │
│                                                                        │
│   router.get('/', optionalAuth, validate(schema), getCourses);        │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 4: Middleware chain executes                                     │
│         a) optionalAuth - Checks for JWT token (optional)             │
│         b) validate - Validates query parameters                      │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 5: Controller (course.controller.js)                             │
│                                                                        │
│   const getCourses = catchAsync(async (req, res) => {                 │
│     const { courses, pagination } = await courseService.getCourses(   │
│       req.query, req.user                                              │
│     );                                                                 │
│     ApiResponse.paginated(res, courses, pagination);                  │
│   });                                                                  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 6: Service (course.service.js)                                   │
│         - Builds MongoDB query filters                                │
│         - Calls Model to fetch data                                   │
│         - Calculates pagination                                       │
│         - Returns formatted data                                      │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 7: Model (course.model.js)                                       │
│         - Mongoose query: Course.find(filter).populate()              │
│         - Returns documents from MongoDB                              │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 8: Response sent back through the chain                          │
│                                                                        │
│   {                                                                    │
│     "success": true,                                                   │
│     "message": "Courses retrieved successfully",                       │
│     "data": [...courses],                                              │
│     "meta": { "pagination": {...} }                                    │
│   }                                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Layer-by-Layer Explanation

### Layer 1: Routes (src/routes/)

**Purpose:** Define URL endpoints and map them to controllers.

```javascript
// src/routes/course.routes.js

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validate(courseValidation.getCourses), courseController.getCourses);

// Protected routes (require authentication)
router.post('/', authenticate, isInstructorOrAdmin, validate(courseValidation.createCourse), courseController.createCourse);
```

**Key Concepts:**
- Routes define the API contract (URL structure)
- Middleware is applied in order (left to right)
- Each route connects to a controller function

---

### Layer 2: Middleware (src/middleware/)

**Purpose:** Process requests before they reach controllers.

#### a) Authentication Middleware

```javascript
// src/middleware/auth.middleware.js

const authenticate = catchAsync(async (req, res, next) => {
  // 1. Get token from Authorization header
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // 2. Verify token
  const decoded = jwt.verify(token, config.jwt.secret);
  
  // 3. Find user and attach to request
  const user = await User.findById(decoded.sub);
  req.user = user;
  
  next(); // Continue to next middleware/controller
});
```

#### b) Validation Middleware

```javascript
// src/middleware/validate.middleware.js

const validate = (schema) => (req, res, next) => {
  // Validate request against Joi schema
  const { error } = Joi.compile(schema).validate({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  
  if (error) {
    return next(ApiError.badRequest(error.message));
  }
  
  next();
};
```

**Middleware Flow Diagram:**

```
Request → [authenticate] → [validate] → [isAdmin] → Controller
              │                │             │
              ▼                ▼             ▼
         Check JWT      Validate Input   Check Role
              │                │             │
         ┌────┴────┐     ┌────┴────┐   ┌────┴────┐
         │ Valid?  │     │ Valid?  │   │ Admin?  │
         └────┬────┘     └────┬────┘   └────┬────┘
           Yes│No          Yes│No        Yes│No
              │  │            │  │          │  │
              ▼  ▼            ▼  ▼          ▼  ▼
           next() 401      next() 400   next() 403
```

---

### Layer 3: Controllers (src/controllers/)

**Purpose:** Handle HTTP request/response, delegate business logic to services.

```javascript
// src/controllers/course.controller.js

const createCourse = catchAsync(async (req, res) => {
  // 1. Call service with request data
  const course = await courseService.createCourse(req.body, req.user._id);
  
  // 2. Send response
  ApiResponse.success(res, 201, 'Course created successfully', { course });
});
```

**Controller Responsibilities:**
- Extract data from request (body, params, query)
- Call appropriate service methods
- Format and send HTTP responses
- Should NOT contain business logic

---

### Layer 4: Services (src/services/)

**Purpose:** Contains all business logic and data operations.

```javascript
// src/services/course.service.js

const createCourse = async (courseData, instructorId) => {
  // Business logic here
  const course = await Course.create({
    ...courseData,
    instructor: instructorId,
  });
  
  // Populate references
  return course.populate([
    { path: 'instructor', select: 'firstName lastName' },
    { path: 'category', select: 'name slug' },
  ]);
};
```

**Service Responsibilities:**
- Implement business rules
- Interact with models
- Handle complex operations
- Can be reused across controllers

---

### Layer 5: Models (src/models/)

**Purpose:** Define database schemas and model methods.

```javascript
// src/models/course.model.js

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // ... more fields
}, { timestamps: true });

// Virtual fields
courseSchema.virtual('modules', {
  ref: 'Module',
  localField: '_id',
  foreignField: 'course',
});

// Instance methods
courseSchema.methods.updateDuration = async function() {
  // Calculate total duration from lessons
};

// Static methods
courseSchema.statics.findPublished = function() {
  return this.find({ isPublished: true });
};
```

---

## 4. Authentication Flow

### Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    POST /api/v1/auth/register                   │
│                                                                 │
│  Body: { firstName, lastName, email, password, role }           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Validation Middleware                      │
│                                                                 │
│  - Check email format                                           │
│  - Check password strength (8+ chars, uppercase, lowercase, #)  │
│  - Check required fields                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Auth Service                              │
│                                                                 │
│  1. Check if email already exists                               │
│  2. Create user (password auto-hashed by model)                 │
│  3. Generate JWT tokens (access + refresh)                      │
│  4. Save refresh token to user document                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Response                                │
│                                                                 │
│  {                                                              │
│    "success": true,                                             │
│    "data": {                                                    │
│      "user": { id, email, role, ... },                          │
│      "tokens": {                                                │
│        "access": { token, expires },                            │
│        "refresh": { token, expires }                            │
│      }                                                          │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     POST /api/v1/auth/login                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Find user by email                                          │
│  2. Compare password with bcrypt                                │
│  3. Check if user is active                                     │
│  4. Generate new tokens                                         │
│  5. Update lastLogin timestamp                                  │
│  6. Return user + tokens                                        │
└─────────────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      Access Token (30 min)                      │
├─────────────────────────────────────────────────────────────────┤
│  Header:  { "alg": "HS256", "typ": "JWT" }                      │
│  Payload: { "sub": "userId", "type": "access", "iat", "exp" }   │
│  Signature: HMACSHA256(header + payload, secret)                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Refresh Token (30 days)                     │
├─────────────────────────────────────────────────────────────────┤
│  - Used to get new access tokens                                │
│  - Stored in database for validation                            │
│  - Can be revoked by setting to null                            │
└─────────────────────────────────────────────────────────────────┘
```

### Token Refresh Flow

```
Access Token Expired?
        │
        ▼
POST /api/v1/auth/refresh-tokens
Body: { refreshToken }
        │
        ▼
┌───────────────────────────────┐
│ 1. Verify refresh token       │
│ 2. Find user                  │
│ 3. Check token matches DB     │
│ 4. Generate new token pair    │
│ 5. Update refresh in DB       │
└───────────────────────────────┘
        │
        ▼
Return new access + refresh tokens
```

---

## 5. Course Management Flow

### Create Course Flow (Instructor)

```
┌─────────────────────────────────────────────────────────────────┐
│                    POST /api/v1/courses                         │
│                                                                 │
│  Headers: Authorization: Bearer <access_token>                  │
│  Body: { title, description, category, price, ... }             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Middleware Chain                             │
│                                                                 │
│  authenticate → isInstructorOrAdmin → validate                  │
│       │                  │                  │                   │
│  Check JWT         Check role is      Validate body            │
│  Attach user      instructor/admin     against schema           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Course Service                               │
│                                                                 │
│  1. Create course with instructor = req.user._id                │
│  2. Auto-generate slug from title                               │
│  3. Set status = 'draft'                                        │
│  4. Populate instructor and category                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Response                                  │
│                                                                 │
│  Status: 201 Created                                            │
│  { "success": true, "data": { "course": {...} } }               │
└─────────────────────────────────────────────────────────────────┘
```

### Course Content Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                          COURSE                                 │
│  (Complete Node.js Developer Course)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    MODULE 1                             │   │
│   │           "Introduction to Node.js"                     │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │  ┌─────────────────┐  ┌─────────────────┐              │   │
│   │  │    LESSON 1     │  │    LESSON 2     │    ...       │   │
│   │  │  "What is       │  │  "Setup Dev     │              │   │
│   │  │   Node.js?"     │  │   Environment"  │              │   │
│   │  │  (video, 15min) │  │  (video, 20min) │              │   │
│   │  └─────────────────┘  └─────────────────┘              │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    MODULE 2                             │   │
│   │           "Working with Express.js"                     │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │  ┌─────────────────┐  ┌─────────────────┐              │   │
│   │  │    LESSON 1     │  │    LESSON 2     │    ...       │   │
│   │  │  "Intro to      │  │  "Creating      │              │   │
│   │  │   Express"      │  │   REST APIs"    │              │   │
│   │  └─────────────────┘  └─────────────────┘              │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Publish Course Flow

```
Course Status Lifecycle:
                                        
  ┌─────────┐    Create    ┌─────────┐    Submit    ┌─────────┐
  │  (new)  │ ──────────▶  │  DRAFT  │ ──────────▶  │ PENDING │
  └─────────┘              └─────────┘              └─────────┘
                                │                        │
                                │ Edit                   │ Admin Review
                                ▼                        ▼
                           ┌─────────┐             ┌──────────┐
                           │  DRAFT  │ ◀────────── │ REJECTED │
                           └─────────┘   Revise    └──────────┘
                                                        │
                                                        │ Approve
                                                        ▼
                                                  ┌───────────┐
                                                  │ PUBLISHED │
                                                  └───────────┘
                                                        │
                                                        │ Unpublish
                                                        ▼
                                                  ┌──────────┐
                                                  │ ARCHIVED │
                                                  └──────────┘
```

---

## 6. Enrollment & Progress Flow

### Student Enrollment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│             POST /api/v1/enrollments/courses/:courseId          │
│                                                                 │
│  Student clicks "Enroll" on a course                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Enrollment Service                           │
├─────────────────────────────────────────────────────────────────┤
│  1. Verify course exists and is published                       │
│  2. Check student not already enrolled                          │
│  3. Process payment (if paid course)                            │
│  4. Create enrollment record                                    │
│  5. Increment course enrollmentCount                            │
│  6. Return enrollment details                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Enrollment Document                            │
├─────────────────────────────────────────────────────────────────┤
│  {                                                              │
│    student: ObjectId,                                           │
│    course: ObjectId,                                            │
│    status: "active",                                            │
│    progress: {                                                  │
│      percentage: 0,                                             │
│      completedLessons: 0,                                       │
│      totalLessons: 10                                           │
│    },                                                           │
│    enrolledAt: Date,                                            │
│    payment: { amount, method, transactionId }                   │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Progress Tracking Flow

```
Student watches a lesson:

┌─────────────────────────────────────────────────────────────────┐
│    PATCH /api/v1/enrollments/courses/:id/lessons/:id/progress   │
│                                                                 │
│    Body: { watchTime: 300, lastPosition: 180, isCompleted: true}│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Progress Service                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Find/create progress record for this lesson                 │
│  2. Update watchTime, lastPosition                              │
│  3. If isCompleted:                                             │
│     - Set completedAt timestamp                                 │
│     - Recalculate enrollment progress %                         │
│     - Check if course completed (100%)                          │
│       → Update enrollment status to 'completed'                 │
│       → Generate certificate (if applicable)                    │
└─────────────────────────────────────────────────────────────────┘

Progress Calculation:
                                        
  Completed Lessons     3
  ─────────────────  = ──  = 30% progress
    Total Lessons      10
```

### Progress Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      Progress Document                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Student   │     │   Course    │     │   Lesson    │       │
│  │  Reference  │     │  Reference  │     │  Reference  │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│         │                  │                   │                │
│         └──────────────────┼───────────────────┘                │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Progress Data:                                          │   │
│  │  - isCompleted: true/false                               │   │
│  │  - completedAt: Date                                     │   │
│  │  - watchTime: 300 (seconds)                              │   │
│  │  - lastPosition: 180 (seconds - resume point)            │   │
│  │  - notes: "My personal notes..."                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE RELATIONSHIPS                          │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌───────────┐
                    │   USER    │
                    │───────────│
                    │ _id       │
                    │ email     │
                    │ role      │◀──────────────────────────────┐
                    │ ...       │                                │
                    └───────────┘                                │
                     │         │                                 │
      ┌──────────────┘         └──────────────┐                 │
      │ instructor                  student   │                 │
      ▼                                       ▼                 │
┌───────────┐                          ┌────────────┐          │
│  COURSE   │                          │ ENROLLMENT │          │
│───────────│                          │────────────│          │
│ _id       │◀─────────────────────────│ course     │          │
│ title     │                          │ student ───┼──────────┘
│ category ─┼───────┐                  │ status     │
│ instructor│       │                  │ progress   │
│ ...       │       │                  └────────────┘
└───────────┘       │                        │
      │             │                        │
      │             ▼                        │
      │      ┌───────────┐                   │
      │      │ CATEGORY  │                   │
      │      │───────────│                   │
      │      │ _id       │                   │
      │      │ name      │                   │
      │      │ slug      │                   │
      │      └───────────┘                   │
      │                                      │
      ▼                                      ▼
┌───────────┐                          ┌────────────┐
│  MODULE   │                          │  PROGRESS  │
│───────────│                          │────────────│
│ _id       │                          │ student    │
│ course    │                          │ course     │
│ title     │                          │ lesson     │
│ order     │                          │ isCompleted│
└───────────┘                          │ watchTime  │
      │                                └────────────┘
      │                                      ▲
      ▼                                      │
┌───────────┐                                │
│  LESSON   │────────────────────────────────┘
│───────────│
│ _id       │
│ module    │
│ course    │
│ title     │
│ type      │
│ duration  │
└───────────┘
```

### Relationship Types

| From | To | Type | Description |
|------|-----|------|-------------|
| Course | User | Many-to-One | Each course has one instructor |
| Course | Category | Many-to-One | Each course belongs to one category |
| Module | Course | Many-to-One | Multiple modules per course |
| Lesson | Module | Many-to-One | Multiple lessons per module |
| Enrollment | User | Many-to-One | Student enrollments |
| Enrollment | Course | Many-to-One | Course enrollments |
| Progress | Enrollment | Many-to-One | Lesson progress per enrollment |
| Review | Course | Many-to-One | Course reviews |
| Review | User | Many-to-One | Review author |

---

## 8. Best Practices Used

### 1. Separation of Concerns

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ROUTES    │───▶│ CONTROLLERS │───▶│  SERVICES   │───▶│   MODELS    │
│             │    │             │    │             │    │             │
│ URL mapping │    │ HTTP logic  │    │ Business    │    │ Data access │
│             │    │             │    │ logic       │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

Each layer has ONE responsibility!
```

### 2. Error Handling

```javascript
// Centralized error handling with custom ApiError class

// In service:
if (!course) {
  throw ApiError.notFound('Course not found');  // Throws 404
}

// In middleware (error.middleware.js):
const errorHandler = (err, req, res, next) => {
  // Converts all errors to consistent format
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
```

### 3. Input Validation

```javascript
// Using Joi schemas for validation

const createCourse = {
  body: Joi.object().keys({
    title: Joi.string().required().max(200),
    price: Joi.number().required().min(0),
    category: Joi.string().custom(objectId).required(),
  }),
};

// Applied as middleware:
router.post('/', validate(createCourse), controller.create);
```

### 4. Security Best Practices

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. helmet()         - Security headers (XSS, clickjacking)     │
│  2. cors()           - Cross-origin restrictions                │
│  3. mongoSanitize()  - Prevent NoSQL injection                  │
│  4. rateLimiter      - Prevent brute force/DDoS                 │
│  5. JWT              - Stateless authentication                 │
│  6. bcrypt           - Password hashing                         │
│  7. Joi validation   - Input sanitization                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Consistent API Responses

```javascript
// Success response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error response  
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Optional validation errors
}

// Paginated response
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "totalResults": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## Quick Reference: API Testing Commands

```bash
# Health Check
curl http://localhost:5000/api/v1/health

# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"Test@123"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eduadmin.com","password":"Admin@123"}'

# Get Courses (Public)
curl http://localhost:5000/api/v1/courses

# Get Courses (with Auth)
curl http://localhost:5000/api/v1/courses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create Course (Instructor)
curl -X POST http://localhost:5000/api/v1/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"My Course","description":"Description","category":"CATEGORY_ID","price":29.99}'
```

---

## Summary

| Layer | File Location | Purpose |
|-------|---------------|---------|
| Routes | `src/routes/` | URL → Controller mapping |
| Middleware | `src/middleware/` | Auth, validation, errors |
| Controllers | `src/controllers/` | HTTP request handling |
| Services | `src/services/` | Business logic |
| Models | `src/models/` | Database schemas |
| Validations | `src/validations/` | Input validation schemas |
| Utils | `src/utils/` | Helper functions |

**Remember:** Data flows like this:
```
Request → Routes → Middleware → Controllers → Services → Models → Database
                                                                    │
Response ← Routes ← Middleware ← Controllers ← Services ← Models ◀─┘
```

---

Happy Learning! 🎓
