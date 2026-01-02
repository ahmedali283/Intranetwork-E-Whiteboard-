@echo off
echo ========================================
echo Starting Virtual Whiteboard Frontend
echo ========================================
echo.

cd frontend

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking npm installation...
npm --version

echo.
echo Installing dependencies (this may take a few minutes)...
npm install

echo.
echo Starting React development server...
echo The browser will open automatically at http://localhost:3000
echo.
npm start

pause
