# EduAdmin - Architecture Diagrams

Visual reference for understanding the system architecture.

---

## 1. High-Level System Overview

```
                              ┌─────────────────────┐
                              │      CLIENTS        │
                              │  (Web, Mobile, API) │
                              └──────────┬──────────┘
                                         │
                                    HTTP/HTTPS
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              EXPRESS SERVER                                │
│                              (Port 5000)                                   │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │                         MIDDLEWARE PIPELINE                            │ │
│ │                                                                        │ │
│ │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │ │
│ │  │ Helmet │→│  CORS  │→│ Morgan │→│  JSON  │→│Sanitize│→│  Rate  │   │ │
│ │  │Security│ │        │ │Logging │ │ Parser │ │        │ │ Limit  │   │ │
│ │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                     │
│                                      ▼                                     │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │                              ROUTER                                    │ │
│ │                                                                        │ │
│ │    /api/v1/auth  →  authRoutes                                         │ │
│ │    /api/v1/users →  userRoutes      (Admin only)                       │ │
│ │    /api/v1/courses → courseRoutes                                      │ │
│ │    /api/v1/categories → categoryRoutes                                 │ │
│ │    /api/v1/enrollments → enrollmentRoutes                              │ │
│ │    /api/v1/admin → adminRoutes      (Admin only)                       │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              MONGODB DATABASE                              │
│                                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Users   │ │ Courses  │ │ Modules  │ │ Lessons  │ │Categories│        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                                   │
│  │Enrollments│ │ Progress │ │ Reviews  │                                   │
│  └──────────┘ └──────────┘ └──────────┘                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Request Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                         REQUEST LIFECYCLE                        │
└──────────────────────────────────────────────────────────────────┘

     CLIENT REQUEST
           │
           ▼
    ┌──────────────┐
    │   Express    │  ← Entry point (app.js)
    │   Server     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Global      │  ← helmet, cors, json parser
    │  Middleware  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Router     │  ← Match URL to route file
    │              │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Route      │  ← Apply route-specific middleware
    │  Middleware  │     (authenticate, validate, authorize)
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Controller  │  ← Extract data, call service
    │              │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Service    │  ← Business logic, call model
    │              │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │    Model     │  ← Database operations
    │              │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   MongoDB    │  ← Store/retrieve data
    │              │
    └──────┬───────┘
           │
           │ (Response travels back up)
           ▼
     CLIENT RESPONSE
```

---

## 3. Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                         │
└──────────────────────────────────────────────────────────────────┘


                         ┌─────────────┐
                         │   CLIENT    │
                         └──────┬──────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
   ┌─────────┐            ┌─────────┐            ┌─────────┐
   │REGISTER │            │  LOGIN  │            │ ACCESS  │
   │         │            │         │            │PROTECTED│
   │         │            │         │            │  ROUTE  │
   └────┬────┘            └────┬────┘            └────┬────┘
        │                      │                      │
        ▼                      ▼                      ▼
   ┌─────────────────────────────────────────────────────────┐
   │                                                         │
   │  REGISTER:                                              │
   │  1. Validate input (email, password strength)           │
   │  2. Check email not taken                               │
   │  3. Hash password (bcrypt)                              │
   │  4. Create user in DB                                   │
   │  5. Generate JWT tokens                                 │
   │  6. Return user + tokens                                │
   │                                                         │
   │  LOGIN:                                                 │
   │  1. Find user by email                                  │
   │  2. Compare password with hash                          │
   │  3. Generate JWT tokens                                 │
   │  4. Update lastLogin                                    │
   │  5. Return user + tokens                                │
   │                                                         │
   │  ACCESS PROTECTED:                                      │
   │  1. Extract token from Authorization header             │
   │  2. Verify JWT signature                                │
   │  3. Find user from token.sub                            │
   │  4. Check user is active                                │
   │  5. Attach user to req.user                             │
   │  6. Continue to controller                              │
   │                                                         │
   └─────────────────────────────────────────────────────────┘
```

---

## 4. Authorization Levels

```
┌──────────────────────────────────────────────────────────────────┐
│                      ROLE-BASED ACCESS                           │
└──────────────────────────────────────────────────────────────────┘


          ADMIN                 INSTRUCTOR              STUDENT
            │                       │                      │
            ▼                       ▼                      ▼
    ┌───────────────┐       ┌───────────────┐      ┌───────────────┐
    │ Full Access   │       │ Course CRUD   │      │ View Courses  │
    │               │       │ (own courses) │      │               │
    │ • All CRUD    │       │               │      │ • Browse      │
    │ • User mgmt   │       │ • Create      │      │ • Enroll      │
    │ • System      │       │ • Edit        │      │ • Watch       │
    │   settings    │       │ • Delete      │      │ • Review      │
    │ • Analytics   │       │ • Publish     │      │               │
    │ • Moderation  │       │               │      │               │
    └───────────────┘       └───────────────┘      └───────────────┘
            │                       │                      │
            └───────────────────────┼──────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │   API ROUTES    │
                          └─────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐      ┌───────────────┐
    │    PUBLIC     │       │   PROTECTED   │      │  ROLE-BASED   │
    │               │       │               │      │               │
    │ • GET courses │       │ • GET profile │      │ • POST course │
    │ • GET reviews │       │ • Enrollment  │      │   (instructor)│
    │ • GET category│       │ • Progress    │      │ • User CRUD   │
    │               │       │               │      │   (admin)     │
    └───────────────┘       └───────────────┘      └───────────────┘


MIDDLEWARE CHAIN:

┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│ optionalAuth│───▶│authenticate│───▶│  isAdmin   │───▶│ Controller │
│            │    │            │    │ isInstructor│    │            │
│ For public │    │ JWT verify │    │ Role check │    │            │
│ routes     │    │            │    │            │    │            │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
```

---

## 5. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       DATA FLOW DIAGRAM                          │
└──────────────────────────────────────────────────────────────────┘


                    ┌─────────────────────────────────┐
                    │          USER ACTIONS           │
                    └────────────────┬────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│   BROWSE      │          │    ENROLL     │          │   PROGRESS    │
│   COURSES     │          │   IN COURSE   │          │   TRACKING    │
└───────┬───────┘          └───────┬───────┘          └───────┬───────┘
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│ Course Service│          │Enrollment Svc │          │Progress Service│
│               │          │               │          │               │
│ - List courses│          │ - Create      │          │ - Track watch │
│ - Filter      │          │   enrollment  │          │   time        │
│ - Search      │          │ - Check dup   │          │ - Mark done   │
│ - Paginate    │          │ - Process pay │          │ - Calculate % │
└───────┬───────┘          └───────┬───────┘          └───────┬───────┘
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│ Course Model  │          │Enrollment Doc │          │ Progress Doc  │
│               │          │               │          │               │
│ MongoDB       │          │ MongoDB       │          │ MongoDB       │
└───────────────┘          └───────────────┘          └───────────────┘
```

---

## 6. Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     ERROR HANDLING FLOW                          │
└──────────────────────────────────────────────────────────────────┘


                    ┌─────────────────┐
                    │  Error Occurs   │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ Validation  │    │  Business   │    │  Database   │
   │   Error     │    │   Error     │    │   Error     │
   │             │    │             │    │             │
   │ Joi schema  │    │ ApiError    │    │ Mongoose    │
   │ failed      │    │ thrown      │    │ error       │
   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   errorConverter    │
                  │                     │
                  │ Converts all errors │
                  │ to ApiError format  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   errorHandler      │
                  │                     │
                  │ Sends JSON response │
                  │ with status code    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   JSON Response     │
                  │                     │
                  │ {                   │
                  │   success: false,   │
                  │   message: "...",   │
                  │   statusCode: 4xx   │
                  │ }                   │
                  └─────────────────────┘


ERROR TYPES:

┌──────────────┬──────────┬─────────────────────────────────────┐
│    Type      │  Code    │           Example                   │
├──────────────┼──────────┼─────────────────────────────────────┤
│ Bad Request  │   400    │ Invalid input data                  │
│ Unauthorized │   401    │ Missing/invalid token               │
│ Forbidden    │   403    │ Insufficient permissions            │
│ Not Found    │   404    │ Resource doesn't exist              │
│ Conflict     │   409    │ Duplicate email/resource            │
│ Internal     │   500    │ Unexpected server error             │
└──────────────┴──────────┴─────────────────────────────────────┘
```

---

## 7. Course Structure

```
┌──────────────────────────────────────────────────────────────────┐
│                      COURSE STRUCTURE                            │
└──────────────────────────────────────────────────────────────────┘


        ┌──────────────────────────────────────────────────────┐
        │                      COURSE                          │
        │  "Complete Node.js Developer Course"                 │
        │──────────────────────────────────────────────────────│
        │  instructor: John (User)                             │
        │  category: Web Development                           │
        │  price: $29.99                                       │
        │  duration: 130 minutes                               │
        │  status: published                                   │
        └──────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  MODULE 1   │    │  MODULE 2   │    │  MODULE 3   │
    │  order: 0   │    │  order: 1   │    │  order: 2   │
    │             │    │             │    │             │
    │ "Intro to   │    │ "Express.js"│    │ "MongoDB"   │
    │  Node.js"   │    │             │    │             │
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                  │                  │
     ┌─────┼─────┐      ┌─────┼─────┐      ┌─────┼─────┐
     │     │     │      │     │     │      │     │     │
     ▼     ▼     ▼      ▼     ▼     ▼      ▼     ▼     ▼
   ┌───┐ ┌───┐ ┌───┐  ┌───┐ ┌───┐ ┌───┐  ┌───┐ ┌───┐ ┌───┐
   │L1 │ │L2 │ │L3 │  │L1 │ │L2 │ │L3 │  │L1 │ │L2 │ │L3 │
   │   │ │   │ │   │  │   │ │   │ │   │  │   │ │   │ │   │
   │15m│ │20m│ │25m│  │18m│ │22m│ │15m│  │20m│ │10m│ │5m │
   └───┘ └───┘ └───┘  └───┘ └───┘ └───┘  └───┘ └───┘ └───┘


LESSON TYPES:

┌─────────────┬────────────────────────────────────────────────┐
│    Type     │                 Content                        │
├─────────────┼────────────────────────────────────────────────┤
│   video     │ videoUrl, videoProvider (youtube/vimeo/local)  │
│   article   │ articleContent (rich text/markdown)            │
│   quiz      │ questions, answers (future feature)            │
│ assignment  │ instructions, submission (future feature)      │
│  resource   │ downloadable files (pdf, docs, etc)            │
└─────────────┴────────────────────────────────────────────────┘
```

---

## 8. Student Journey

```
┌──────────────────────────────────────────────────────────────────┐
│                      STUDENT JOURNEY                             │
└──────────────────────────────────────────────────────────────────┘


  ┌──────────┐
  │ REGISTER │
  └────┬─────┘
       │
       ▼
  ┌──────────┐     ┌───────────────────────────────────────────┐
  │  LOGIN   │────▶│ Receive: Access Token + Refresh Token    │
  └────┬─────┘     └───────────────────────────────────────────┘
       │
       ▼
  ┌──────────┐
  │  BROWSE  │
  │ COURSES  │
  └────┬─────┘
       │
       ▼
  ┌──────────┐     ┌───────────────────────────────────────────┐
  │  ENROLL  │────▶│ Created: Enrollment record                │
  └────┬─────┘     │ Progress: 0%                              │
       │           └───────────────────────────────────────────┘
       ▼
  ┌──────────┐
  │  WATCH   │
  │ LESSONS  │
  └────┬─────┘
       │
       ├──────────────────────────────────────────────────────┐
       │                                                      │
       ▼                                                      ▼
  ┌───────────┐                                        ┌───────────┐
  │  UPDATE   │                                        │   MARK    │
  │ PROGRESS  │                                        │ COMPLETE  │
  │           │                                        │           │
  │ watchTime │                                        │ isComplete│
  │ position  │                                        │ = true    │
  └─────┬─────┘                                        └─────┬─────┘
        │                                                    │
        │                                                    │
        │           ┌─────────────────────────────┐         │
        └──────────▶│ ENROLLMENT PROGRESS UPDATED │◀────────┘
                    │                             │
                    │ completedLessons: X         │
                    │ totalLessons: Y             │
                    │ percentage: (X/Y) * 100     │
                    └──────────────┬──────────────┘
                                   │
                                   │ if percentage === 100
                                   ▼
                    ┌─────────────────────────────┐
                    │     COURSE COMPLETED!       │
                    │                             │
                    │ • Status → 'completed'      │
                    │ • completedAt → Date        │
                    │ • Certificate generated     │
                    └─────────────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       LEAVE REVIEW          │
                    │                             │
                    │ rating: 1-5 stars           │
                    │ comment: "Great course!"    │
                    └─────────────────────────────┘
```

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE CARD                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  LAYERS:                                                       │
│  Routes → Middleware → Controllers → Services → Models → DB   │
│                                                                │
│  FILES:                                                        │
│  routes/*.js → middleware/*.js → controllers/*.js →            │
│  services/*.js → models/*.js → MongoDB                         │
│                                                                │
│  AUTH MIDDLEWARE:                                              │
│  authenticate   : Requires valid JWT                           │
│  optionalAuth   : JWT optional (public routes)                 │
│  isAdmin        : Must be admin role                           │
│  isInstructorOrAdmin : Must be instructor/admin                │
│                                                                │
│  RESPONSE FORMAT:                                              │
│  Success: { success: true, data: {...} }                       │
│  Error:   { success: false, message: "..." }                   │
│                                                                │
│  HTTP STATUS CODES:                                            │
│  200 OK         : Successful GET/PUT/PATCH                     │
│  201 Created    : Successful POST                              │
│  400 Bad Request: Invalid input                                │
│  401 Unauthorized: Missing/invalid auth                        │
│  403 Forbidden  : Insufficient permissions                     │
│  404 Not Found  : Resource not found                           │
│  500 Server Error: Unexpected error                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
