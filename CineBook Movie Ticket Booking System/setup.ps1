# CineBook Setup Script (Windows PowerShell)
Write-Host "🎬 CineBook Setup Script" -ForegroundColor Cyan

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Create .env
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..."
    @"
NODE_ENV=development
PORT=3002
API_VERSION=v1
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cinebook_db?schema=public"
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
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

npm run db:generate

Write-Host "`n[NEXT STEPS]" -ForegroundColor Yellow
Write-Host "1. Create database: CREATE DATABASE cinebook_db;"
Write-Host "2. Update .env with your PostgreSQL credentials"
Write-Host "3. Run: npm run db:push"
Write-Host "4. Run: npm run db:seed"
Write-Host "5. Run: npm run dev"
Write-Host "`nAdmin: admin@cinebook.com / Admin@123" -ForegroundColor Green
