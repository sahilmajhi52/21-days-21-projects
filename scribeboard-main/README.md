# 📝 ScribeBoard API

A full-fledged **Blog CMS Backend Service** with authors, posts, categories, comments, drafts, and publishing workflows.

## ✨ Features

- **User Roles**: Admin, Editor, Author, Reader
- **Blog Posts**: Full CRUD with rich content support
- **Publishing Workflow**: Draft → Review → Publish → Unpublish
- **Categories & Tags**: Organize content effectively
- **Comment System**: Nested comments with moderation
- **Search & Filter**: Find posts by category, tag, author, or keyword
- **Pagination**: Efficient data loading
- **Revision History**: Track post changes

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| PostgreSQL | Database |
| Prisma | ORM |
| JWT | Authentication |
| Joi | Validation |
| Helmet | Security |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
# Clone repository
git clone https://github.com/q225/scribeboard.git
cd scribeboard

# Run setup script
chmod +x setup.sh
./setup.sh

# Or on Windows PowerShell
.\setup.ps1

# Start development server
npm run dev
```

### Manual Setup

```bash
# Install dependencies
npm install

# Create .env file
cp env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database
npm run db:seed

# Start server
npm run dev
```

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@scribeboard.com | Admin@123 |
| Editor | editor@scribeboard.com | Admin@123 |
| Author | author@scribeboard.com | Admin@123 |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh-tokens | Refresh tokens |
| POST | /api/v1/auth/logout | Logout |
| GET | /api/v1/auth/profile | Get profile |
| PATCH | /api/v1/auth/profile | Update profile |
| POST | /api/v1/auth/change-password | Change password |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/posts | List posts (with filters) |
| GET | /api/v1/posts/:id | Get single post |
| POST | /api/v1/posts | Create post (draft) |
| PATCH | /api/v1/posts/:id | Update post |
| DELETE | /api/v1/posts/:id | Delete post |
| POST | /api/v1/posts/:id/publish | Publish post |
| POST | /api/v1/posts/:id/unpublish | Unpublish post |
| POST | /api/v1/posts/:id/submit-review | Submit for review |
| GET | /api/v1/posts/:id/revisions | Get revision history |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/categories | List categories |
| GET | /api/v1/categories/:id | Get category |
| POST | /api/v1/categories | Create category |
| PATCH | /api/v1/categories/:id | Update category |
| DELETE | /api/v1/categories/:id | Delete category |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/posts/:postId/comments | Get post comments |
| POST | /api/v1/posts/:postId/comments | Add comment |
| GET | /api/v1/comments | List all comments (admin) |
| POST | /api/v1/comments/:id/approve | Approve comment |
| POST | /api/v1/comments/:id/reject | Reject comment |
| POST | /api/v1/comments/:id/spam | Mark as spam |
| DELETE | /api/v1/comments/:id | Delete comment |

### Authors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/authors/:id | Get author profile |
| GET | /api/v1/authors/:id/posts | Get author's posts |

## 🔍 Query Parameters

### Posts

```bash
# Filter by status
GET /api/v1/posts?status=PUBLISHED

# Filter by category
GET /api/v1/posts?category=technology

# Filter by tag
GET /api/v1/posts?tag=nodejs

# Search
GET /api/v1/posts?search=javascript

# Featured posts
GET /api/v1/posts?featured=true

# Pagination
GET /api/v1/posts?page=1&limit=10

# Sort
GET /api/v1/posts?sort=-publishedAt  # Newest first
GET /api/v1/posts?sort=title          # A-Z
```

## 📂 Project Structure

```
scribeboard/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Seed data
├── src/
│   ├── config/            # Configuration
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Helpers
│   ├── validators/        # Joi schemas
│   ├── app.js             # Express app
│   └── server.js          # Entry point
├── .env.example
├── package.json
└── README.md
```

## 🔄 Publishing Workflow

```
┌─────────┐     ┌─────────────────┐     ┌───────────┐
│  DRAFT  │────▶│ PENDING_REVIEW  │────▶│ PUBLISHED │
└─────────┘     └─────────────────┘     └─────┬─────┘
     │                                        │
     │                                        ▼
     │                               ┌─────────────┐
     └──────────────────────────────▶│ UNPUBLISHED │
                                     └─────────────┘
```

| Status | Description |
|--------|-------------|
| DRAFT | Work in progress, not visible to public |
| PENDING_REVIEW | Submitted for editor review |
| PUBLISHED | Live and visible to public |
| UNPUBLISHED | Removed from public but not deleted |
| ARCHIVED | Long-term storage |

## 🛡️ User Roles

| Role | Permissions |
|------|-------------|
| ADMIN | Full access, manage users |
| EDITOR | Manage all posts, moderate comments, manage categories |
| AUTHOR | Create/edit own posts, comment |
| READER | View posts, comment (when logged in) |

## 📝 Example Requests

### Login
```bash
curl -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"author@scribeboard.com","password":"Admin@123"}'
```

### Create Post
```bash
curl -X POST http://localhost:3003/api/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the content of my blog post...",
    "categoryId": "CATEGORY_ID",
    "tags": ["tutorial", "beginner"]
  }'
```

### Publish Post
```bash
curl -X POST http://localhost:3003/api/v1/posts/POST_ID/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Comment
```bash
curl -X POST http://localhost:3003/api/v1/posts/POST_ID/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great article!"}'
```

## 📄 License

MIT

---

Made with ❤️ for content creators
