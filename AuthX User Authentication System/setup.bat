@echo off
:: AuthX Quick Setup Script for Windows
:: Run this after cloning: setup.bat

echo.
echo ========================================
echo    AuthX Setup Script (Windows)
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo         Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1,2,3 delims=." %%a in ('node -v') do set NODE_VER=%%a
set NODE_VER=%NODE_VER:v=%
echo [OK] Node.js found

:: Install dependencies
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

:: Create .env file if not exists
if not exist .env (
    echo.
    echo Creating .env file...
    (
        echo # Server Configuration
        echo NODE_ENV=development
        echo PORT=3001
        echo API_VERSION=v1
        echo.
        echo # Database Configuration ^(PostgreSQL^)
        echo # Update this with your PostgreSQL credentials
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/authx_db?schema=public"
        echo.
        echo # JWT Configuration ^(Change these in production!^)
        echo JWT_ACCESS_SECRET=authx-dev-access-secret-change-in-production-32chars
        echo JWT_REFRESH_SECRET=authx-dev-refresh-secret-change-in-production-32chars
        echo JWT_ACCESS_EXPIRES_IN=15m
        echo JWT_REFRESH_EXPIRES_IN=7d
        echo.
        echo # Security Configuration
        echo BCRYPT_SALT_ROUNDS=12
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=http://localhost:3000
        echo.
        echo # Cookie Configuration
        echo COOKIE_SECURE=false
        echo COOKIE_HTTP_ONLY=true
        echo COOKIE_SAME_SITE=strict
    ) > .env
    echo [OK] .env file created
    echo.
    echo [IMPORTANT] Edit .env file with your PostgreSQL credentials!
) else (
    echo [OK] .env file already exists
)

:: Generate Prisma client
echo.
echo Generating Prisma client...
call npm run db:generate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [OK] Prisma client generated

echo.
echo ========================================
echo    NEXT STEPS
echo ========================================
echo.
echo 1. Make sure PostgreSQL is running
echo.
echo 2. Create the database:
echo    Open pgAdmin or run: createdb authx_db
echo.
echo 3. Update .env file with your PostgreSQL credentials:
echo    DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/authx_db"
echo.
echo 4. Push database schema:
echo    npm run db:push
echo.
echo 5. Seed the database:
echo    npm run db:seed
echo.
echo 6. Start the server:
echo    npm run dev
echo.
echo ========================================
echo    Default Admin Credentials
echo ========================================
echo    Email:    admin@authx.local
echo    Password: Admin@123!
echo ========================================
echo.
pause
