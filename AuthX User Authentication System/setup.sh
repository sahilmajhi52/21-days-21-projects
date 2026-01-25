#!/bin/bash

# AuthX Quick Setup Script
# Run this after cloning: ./setup.sh

echo "🔐 AuthX Setup Script"
echo "====================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL CLI not found. Make sure PostgreSQL is installed.${NC}"
    echo "   Install with: brew install postgresql@15"
else
    echo -e "${GREEN}✓ PostgreSQL found${NC}"
fi

echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Create .env file
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    
    # Get username for database URL
    DB_USER=${USER:-postgres}
    
    cat > .env << EOF
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database Configuration (PostgreSQL)
# Update this with your PostgreSQL credentials
DATABASE_URL="postgresql://${DB_USER}@localhost:5432/authx_db?schema=public"

# JWT Configuration (Change these in production!)
JWT_ACCESS_SECRET=authx-dev-access-secret-change-in-production-32chars
JWT_REFRESH_SECRET=authx-dev-refresh-secret-change-in-production-32chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Cookie Configuration
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=strict
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
fi
echo ""

# Create database
echo "🗄️  Setting up database..."
createdb authx_db 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database 'authx_db' created${NC}"
else
    echo -e "${YELLOW}⚠️  Database may already exist or PostgreSQL not running${NC}"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

# Push database schema
echo "📊 Pushing database schema..."
npm run db:push
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push database schema${NC}"
    echo "   Make sure PostgreSQL is running and DATABASE_URL in .env is correct"
    exit 1
fi
echo -e "${GREEN}✓ Database schema created${NC}"
echo ""

# Seed database
echo "🌱 Seeding database with initial data..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to seed database${NC}"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "To start the server:"
echo -e "  ${GREEN}npm run dev${NC}"
echo ""
echo "Server will run at:"
echo -e "  ${GREEN}http://localhost:3001${NC}"
echo ""
echo "Default admin credentials:"
echo -e "  Email:    ${GREEN}admin@authx.local${NC}"
echo -e "  Password: ${GREEN}Admin@123!${NC}"
echo ""
echo "API Documentation:"
echo -e "  Health:  ${GREEN}http://localhost:3001/api/v1/health${NC}"
echo -e "  Login:   ${GREEN}POST http://localhost:3001/api/v1/auth/login${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════"
