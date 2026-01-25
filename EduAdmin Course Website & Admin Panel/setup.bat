@echo off
setlocal enabledelayedexpansion

:: EduAdmin Setup Script for Windows (Command Prompt)
:: This script sets up the development environment

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║   🎓 EduAdmin - Setup Script (Windows)                    ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

:: Check if Node.js is installed
echo Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    echo    Visit: https://nodejs.org/
    exit /b 1
)

for /f "tokens=1 delims=v" %%a in ('node -v') do set NODE_VER=%%a
for /f "tokens=1 delims=." %%a in ('node -v') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%

echo ✅ Node.js is installed

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed.
    exit /b 1
)
echo ✅ npm is installed

echo.
echo Installing dependencies...
call npm install

echo.
echo Setting up environment file...

if not exist .env (
    copy env.example .env >nul
    echo ✅ Created .env file from env.example
    echo ⚠️  Please update .env file with your configuration
) else (
    echo ✅ .env file already exists
)

:: Create uploads directory
echo.
echo Creating uploads directory...
if not exist uploads mkdir uploads
echo. > uploads\.gitkeep
echo ✅ Uploads directory created

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║   ✅ Setup Complete!                                      ║
echo ║                                                           ║
echo ║   Next steps:                                             ║
echo ║   1. Update .env file with your MongoDB URI               ║
echo ║   2. Run 'npm run seed' to create test data               ║
echo ║   3. Run 'npm run dev' to start the server                ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝

endlocal
