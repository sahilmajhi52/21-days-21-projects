# ScribeBoard API Setup Script (Windows PowerShell)

Write-Host "📝 ScribeBoard API - Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Create .env file
if (!(Test-Path .env)) {
    Write-Host ""
    Write-Host "📄 Creating .env file..." -ForegroundColor Yellow
    Copy-Item env.example .env
    
    # Generate secrets
    $accessSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $refreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    # Update .env
    (Get-Content .env) -replace 'your-super-secret-access-key-min-32-characters', $accessSecret | Set-Content .env
    (Get-Content .env) -replace 'your-super-secret-refresh-key-min-32-characters', $refreshSecret | Set-Content .env
    
    Write-Host "✅ .env file created with generated secrets" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Please update DATABASE_URL in .env with your PostgreSQL credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Generate Prisma client
Write-Host ""
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Push database schema
Write-Host ""
Write-Host "📊 Pushing database schema..." -ForegroundColor Yellow
npx prisma db push

# Seed database
Write-Host ""
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
npm run db:seed

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the server:" -ForegroundColor Cyan
Write-Host "  npm run dev     (development with hot reload)"
Write-Host "  npm start       (production)"
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Cyan
Write-Host "  admin@scribeboard.com  / Admin@123 (Admin)"
Write-Host "  editor@scribeboard.com / Admin@123 (Editor)"
Write-Host "  author@scribeboard.com / Admin@123 (Author)"
