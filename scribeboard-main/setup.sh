#!/bin/bash

# ScribeBoard API Setup Script

echo "📝 ScribeBoard API - Setup Script"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL CLI not found. Make sure PostgreSQL is running."
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file
if [ ! -f .env ]; then
    echo ""
    echo "📄 Creating .env file..."
    cp env.example .env
    
    # Generate secrets
    ACCESS_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "scribeboard-access-secret-$(date +%s)")
    REFRESH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "scribeboard-refresh-secret-$(date +%s)")
    
    # Update .env with generated secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|your-super-secret-access-key-min-32-characters|$ACCESS_SECRET|g" .env
        sed -i '' "s|your-super-secret-refresh-key-min-32-characters|$REFRESH_SECRET|g" .env
    else
        sed -i "s|your-super-secret-access-key-min-32-characters|$ACCESS_SECRET|g" .env
        sed -i "s|your-super-secret-refresh-key-min-32-characters|$REFRESH_SECRET|g" .env
    fi
    
    echo "✅ .env file created with generated secrets"
    echo ""
    echo "⚠️  Please update DATABASE_URL in .env with your PostgreSQL credentials"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo ""
echo "📊 Pushing database schema..."
npx prisma db push

# Seed database
echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  npm run dev     (development with hot reload)"
echo "  npm start       (production)"
echo ""
echo "Test Accounts:"
echo "  admin@scribeboard.com  / Admin@123 (Admin)"
echo "  editor@scribeboard.com / Admin@123 (Editor)"
echo "  author@scribeboard.com / Admin@123 (Author)"
