@echo off
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   💳 GFGPay - Setup Script (Windows)                      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)
echo ✅ Node.js is installed

echo.
echo Installing dependencies...
call npm install

echo.
echo Setting up environment...
if not exist .env (
    copy env.example .env >nul
    echo ✅ Created .env file
) else (
    echo ✅ .env file already exists
)

if not exist logs mkdir logs

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   ✅ Setup Complete!                                      ║
echo ║                                                           ║
echo ║   Next steps:                                             ║
echo ║   1. Update .env with your MongoDB URI                    ║
echo ║   2. Run 'npm run seed' to create test data               ║
echo ║   3. Run 'npm run dev' to start the server                ║
echo ╚═══════════════════════════════════════════════════════════╝
