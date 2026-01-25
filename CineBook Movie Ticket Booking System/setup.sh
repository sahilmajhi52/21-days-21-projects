#!/bin/bash

# CineBook Setup Script
echo "🎬 CineBook Setup Script"
echo "========================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✓ Node.js $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    DB_USER=${USER:-postgres}
    cat > .env << EOF
NODE_ENV=development
PORT=3002
API_VERSION=v1
DATABASE_URL="postgresql://${DB_USER}@localhost:5432/cinebook_db?schema=public"
JWT_ACCESS_SECRET=cinebook-dev-access-secret-32chars
JWT_REFRESH_SECRET=cinebook-dev-refresh-secret-32chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BOOKING_LOCK_MINUTES=10
MAX_SEATS_PER_BOOKING=10
CONVENIENCE_FEE_PERCENT=2.5
TAX_PERCENT=18
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
EOF
    echo "✓ .env created"
fi

# Create database
createdb cinebook_db 2>/dev/null && echo "✓ Database created" || echo "⚠️ Database may exist"

# Setup database
echo "🔧 Setting up database..."
npm run db:generate
npm run db:push
npm run db:seed

echo ""
echo "════════════════════════════════════════"
echo "  ✅ Setup Complete!"
echo "════════════════════════════════════════"
echo "  Run: npm run dev"
echo "  URL: http://localhost:3002"
echo ""
echo "  Admin: admin@cinebook.com / Admin@123"
echo "════════════════════════════════════════"
