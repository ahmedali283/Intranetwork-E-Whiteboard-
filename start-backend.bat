@echo off
echo ========================================
echo Starting Virtual Whiteboard Backend
echo ========================================
echo.

cd backend

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask-SocketIO server on port 8080...
echo.
python app.py

pause
