#!/bin/bash

# AuthX API Test Script
# Usage: ./test-api.sh

BASE_URL="http://localhost:3001/api/v1"

echo "🔐 AuthX API Test Script"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Testing Health Check...${NC}"
HEALTH=$(curl -s "$BASE_URL/health")
echo "$HEALTH" | grep -q "success" && echo -e "${GREEN}✓ Health check passed${NC}" || echo -e "${RED}✗ Health check failed${NC}"
echo ""

# 2. Register a new user
echo -e "${BLUE}2. Registering new user...${NC}"
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@test.com",
    "username": "demouser",
    "password": "Demo@123!",
    "firstName": "Demo",
    "lastName": "User"
  }')
echo "$REGISTER" | grep -q "accessToken" && echo -e "${GREEN}✓ Registration successful${NC}" || echo "$REGISTER"
echo ""

# 3. Login as admin
echo -e "${BLUE}3. Logging in as admin...${NC}"
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@authx.local",
    "password": "Admin@123!"
  }')

# Extract access token
TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "  Token: ${TOKEN:0:50}..."
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN"
  exit 1
fi
echo ""

# 4. Get current user
echo -e "${BLUE}4. Getting current user (me)...${NC}"
ME=$(curl -s "$BASE_URL/auth/me" -H "Authorization: Bearer $TOKEN")
echo "$ME" | grep -q "admin@authx.local" && echo -e "${GREEN}✓ User profile retrieved${NC}" || echo "$ME"
echo ""

# 5. Get all roles
echo -e "${BLUE}5. Getting all roles...${NC}"
ROLES=$(curl -s "$BASE_URL/roles" -H "Authorization: Bearer $TOKEN")
echo "$ROLES" | grep -q "admin" && echo -e "${GREEN}✓ Roles retrieved (admin, moderator, user)${NC}" || echo "$ROLES"
echo ""

# 6. Get all permissions
echo -e "${BLUE}6. Getting all permissions...${NC}"
PERMS=$(curl -s "$BASE_URL/permissions" -H "Authorization: Bearer $TOKEN")
echo "$PERMS" | grep -q "permissions" && echo -e "${GREEN}✓ Permissions retrieved${NC}" || echo "$PERMS"
echo ""

# 7. Get all users
echo -e "${BLUE}7. Getting all users...${NC}"
USERS=$(curl -s "$BASE_URL/users" -H "Authorization: Bearer $TOKEN")
echo "$USERS" | grep -q "users" && echo -e "${GREEN}✓ Users list retrieved${NC}" || echo "$USERS"
echo ""

# 8. Get active sessions
echo -e "${BLUE}8. Getting active sessions...${NC}"
SESSIONS=$(curl -s "$BASE_URL/auth/sessions" -H "Authorization: Bearer $TOKEN")
echo "$SESSIONS" | grep -q "sessions" && echo -e "${GREEN}✓ Sessions retrieved${NC}" || echo "$SESSIONS"
echo ""

echo "========================"
echo -e "${GREEN}🎉 All tests completed!${NC}"
echo ""
echo "Admin Token for further testing:"
echo "$TOKEN"
