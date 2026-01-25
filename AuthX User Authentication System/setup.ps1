# AuthX Quick Setup Script for Windows (PowerShell)
# Run this after cloning: .\setup.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AuthX Setup Script (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "[OK] Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "        Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dependencies installed" -ForegroundColor Green

# Create .env file if not exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database Configuration (PostgreSQL)
# Update this with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/authx_db?schema=public"

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
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "[OK] .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "[IMPORTANT] Edit .env file with your PostgreSQL credentials!" -ForegroundColor Yellow
} else {
    Write-Host "[OK] .env file already exists" -ForegroundColor Green
}

# Generate Prisma client
Write-Host ""
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Prisma client generated" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure PostgreSQL is running" -ForegroundColor White
Write-Host ""
Write-Host "2. Create the database (run in Command Prompt or pgAdmin):" -ForegroundColor White
Write-Host "   createdb -U postgres authx_db" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update .env file with your PostgreSQL credentials:" -ForegroundColor White
Write-Host '   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/authx_db"' -ForegroundColor Gray
Write-Host ""
Write-Host "4. Push database schema:" -ForegroundColor White
Write-Host "   npm run db:push" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Seed the database:" -ForegroundColor White
Write-Host "   npm run db:seed" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Start the server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Default Admin Credentials" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Email:    admin@authx.local" -ForegroundColor White
Write-Host "   Password: Admin@123!" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
