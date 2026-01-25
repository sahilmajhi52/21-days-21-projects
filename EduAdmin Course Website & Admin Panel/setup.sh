#!/bin/bash

# EduAdmin Setup Script for macOS/Linux
# This script sets up the development environment

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🎓 EduAdmin - Setup Script (macOS/Linux)                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) is installed${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v) is installed${NC}"

# Check if MongoDB is running (optional check)
echo -e "${YELLOW}Checking MongoDB...${NC}"
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB is installed${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB is not installed locally. Make sure you have MongoDB Atlas or Docker running.${NC}"
fi

echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

echo ""
echo -e "${YELLOW}Setting up environment file...${NC}"

if [ ! -f .env ]; then
    cp env.example .env
    echo -e "${GREEN}✅ Created .env file from env.example${NC}"
    echo -e "${YELLOW}⚠️  Please update .env file with your configuration${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create uploads directory
echo ""
echo -e "${YELLOW}Creating uploads directory...${NC}"
mkdir -p uploads
touch uploads/.gitkeep
echo -e "${GREEN}✅ Uploads directory created${NC}"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ Setup Complete!                                      ║"
echo "║                                                           ║"
echo "║   Next steps:                                             ║"
echo "║   1. Update .env file with your MongoDB URI               ║"
echo "║   2. Run 'npm run seed' to create test data               ║"
echo "║   3. Run 'npm run dev' to start the server                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
