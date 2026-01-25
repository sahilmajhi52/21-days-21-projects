# 🚀 ShipIt API

> **Deploy to Production in One Session!**

A minimal yet production-ready Express.js API designed to teach deployment fundamentals. Perfect for workshops focused on shipping code to the cloud.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Workshop Guide](#-workshop-guide)
- [API Endpoints](#-api-endpoints)
- [Deployment to Render](#-deployment-to-render)
- [Environment Configuration](#-environment-configuration)
- [Project Structure](#-project-structure)

---

## 🎯 Overview

### What You'll Learn

| Concept | Description |
|---------|-------------|
| **Environment Configuration** | How to manage dev/prod settings |
| **Health Checks** | Why they matter for deployments |
| **Graceful Shutdown** | Handling termination signals |
| **Structured Logging** | Production-ready logging patterns |
| **Zero-Downtime Deploy** | How Render achieves this |

### Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Security:** Helmet, CORS
- **Logging:** Morgan + Custom Logger
- **Deployment:** Render

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account
- Render account (free tier works!)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/q225/shipit-api.git
cd shipit-api

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Start development server
npm run dev
```

### Verify It Works

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api/v1

# Detailed health
curl http://localhost:3000/health/detailed
```

---

## 📚 Workshop Guide

### Session Timeline (60 minutes)

| Time | Activity |
|------|----------|
| 0-5 min | Introduction & Overview |
| 5-15 min | Local Setup & Code Tour |
| 15-25 min | Understanding Environment Configs |
| 25-40 min | Deploy to Render |
| 40-50 min | Test Production Deployment |
| 50-60 min | Q&A & Next Steps |

---

### Part 1: Understanding the Code (10 min)

#### The Configuration System

```
┌─────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   .env file          →    dotenv loads    →    config/      │
│   (secrets)               into process         index.js     │
│                           .env                 (validation) │
│                                                             │
│   Example:                                                  │
│   PORT=3000          →    process.env.PORT →   config.port  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Why Health Checks Matter

```
┌─────────────────────────────────────────────────────────────┐
│               HEALTH CHECK IN ACTION                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Load Balancer                                             │
│        │                                                    │
│        ├──→ GET /health ──→ Server 1 ✅ (200 OK)           │
│        │                                                    │
│        ├──→ GET /health ──→ Server 2 ✅ (200 OK)           │
│        │                                                    │
│        └──→ GET /health ──→ Server 3 ❌ (No response)      │
│                              └── Remove from rotation!      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Part 2: Local Testing (10 min)

#### Test All Endpoints

```bash
# 1. Root endpoint
curl http://localhost:3000/

# 2. Health check (simple)
curl http://localhost:3000/health

# 3. Health check (detailed)
curl http://localhost:3000/health/detailed

# 4. API info
curl http://localhost:3000/api/v1

# 5. Get items
curl http://localhost:3000/api/v1/items

# 6. Get single item
curl http://localhost:3000/api/v1/items/1

# 7. Echo endpoint (POST)
curl -X POST http://localhost:3000/api/v1/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, ShipIt!"}'

# 8. Test error handling
curl http://localhost:3000/api/v1/error

# 9. Test 404 handling
curl http://localhost:3000/nonexistent
```

---

### Part 3: Deploy to Render (15 min)

#### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: ShipIt API ready for deployment"

# Push to GitHub (create repo first on github.com)
git remote add origin https://github.com/YOUR_USERNAME/shipit-api.git
git push -u origin main
```

#### Step 2: Connect to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select the `shipit-api` repository
5. Configure:
   - **Name:** `shipit-api`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
7. Click **"Create Web Service"**

#### Step 3: Watch the Magic! 🎉

```
┌─────────────────────────────────────────────────────────────┐
│                  RENDER DEPLOYMENT FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. Push to GitHub                                         │
│        │                                                    │
│        ▼                                                    │
│   2. Render detects change                                  │
│        │                                                    │
│        ▼                                                    │
│   3. npm install (build)                                    │
│        │                                                    │
│        ▼                                                    │
│   4. npm start (deploy)                                     │
│        │                                                    │
│        ▼                                                    │
│   5. Health check passes                                    │
│        │                                                    │
│        ▼                                                    │
│   6. Traffic routes to new version                          │
│        │                                                    │
│        ▼                                                    │
│   7. Old version terminated (zero downtime!)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Part 4: Test Production (10 min)

Replace `YOUR-APP` with your Render URL:

```bash
# Health check
curl https://YOUR-APP.onrender.com/health

# Detailed health
curl https://YOUR-APP.onrender.com/health/detailed

# API endpoint
curl https://YOUR-APP.onrender.com/api/v1/items

# Verify production mode
curl https://YOUR-APP.onrender.com/api/v1/config
# Should return 403 Forbidden!
```

---

## 📡 API Endpoints

### Health Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe |
| GET | `/health/detailed` | Detailed system info |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1` | API information |
| GET | `/api/v1/items` | List all items |
| GET | `/api/v1/items/:id` | Get item by ID |
| POST | `/api/v1/echo` | Echo request body |
| GET | `/api/v1/config` | Show config (dev only) |
| GET | `/api/v1/error` | Test error handling |

---

## ⚙️ Environment Configuration

### Development (.env)

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
CORS_ORIGIN=*
```

### Production (Render Dashboard)

```env
NODE_ENV=production
PORT=10000
LOG_LEVEL=info
CORS_ORIGIN=https://your-frontend.com
```

### Configuration Differences

| Setting | Development | Production |
|---------|-------------|------------|
| Logging | Colored, verbose | JSON, minimal |
| Errors | Full stack traces | Messages only |
| Config endpoint | Enabled | Disabled |
| CORS | Allow all | Restricted |

---

## 📁 Project Structure

```
shipit-api/
├── src/
│   ├── config/
│   │   └── index.js        # Environment configuration
│   ├── middleware/
│   │   ├── errorHandler.js # Global error handling
│   │   └── requestLogger.js# Custom request logging
│   ├── routes/
│   │   ├── api.routes.js   # API endpoints
│   │   ├── health.routes.js# Health check endpoints
│   │   └── index.js        # Route aggregator
│   ├── utils/
│   │   └── logger.js       # Structured logging utility
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── .gitignore
├── env.example
├── package.json
├── render.yaml             # Render deployment config
└── README.md
```

---

## 🎓 Key Takeaways

1. **Environment Variables** - Never hardcode secrets; use `.env` locally and dashboard in production

2. **Health Checks** - Essential for load balancers and zero-downtime deployments

3. **Graceful Shutdown** - Handle SIGTERM to allow in-flight requests to complete

4. **Structured Logging** - JSON logs in production for easier parsing

5. **Security Headers** - Always use Helmet in production

---

## 📚 Next Steps

After this workshop, explore:

- [ ] Add a database (PostgreSQL on Render)
- [ ] Add authentication (JWT)
- [ ] Set up CI/CD with GitHub Actions
- [ ] Add monitoring (Render Metrics)
- [ ] Configure custom domain

---

## 🤝 Resources

- [Render Documentation](https://render.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [12-Factor App Methodology](https://12factor.net/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Happy Shipping! 🚀**
