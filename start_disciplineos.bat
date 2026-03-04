@echo off
title DisciplineOS — Starting...
color 0A

echo.
echo  ========================================
echo    DisciplineOS — Personal Command Center
echo  ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  Node.js is not installed!
    echo  Please install from https://nodejs.org
    pause
    exit /b 1
)

:: Navigate to project directory
cd /d "%~dp0"

:: Check if node_modules exists, if not install
if not exist "node_modules" (
    echo  First run detected! Installing dependencies...
    echo  This may take a few minutes...
    call npm install
    echo.
    echo  Setting up database...
    call npx prisma generate
    call npx prisma db push
    echo.
)

:: Generate Prisma client (in case schema changed)
call npx prisma generate >nul 2>nul

:: Run any pending migrations
call npx prisma db push >nul 2>nul

echo  Starting DisciplineOS...
echo  Open your browser at: http://localhost:3000
echo  Password: admin@123
echo.
echo  Press Ctrl+C to stop the server.
echo  ========================================
echo.

:: Wait 4 seconds then open browser
start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

:: Start the Next.js dev server
call npm run dev
