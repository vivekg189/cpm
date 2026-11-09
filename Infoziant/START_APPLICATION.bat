@echo off
REM VehicleVault Application Startup Script
REM Run this script to start the complete application

echo ========================================
echo   VehicleVault Application Starter
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running or not installed!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✓ Docker is running

echo.
echo [2/4] Starting services (building images if needed)...
docker compose up --build -d

echo.
echo [3/4] Waiting for services to be healthy...
timeout /t 15 /nobreak >nul

echo.
echo [4/4] Checking service status...
docker compose ps

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Access your application at:
echo   🌐 Web App:  http://localhost:8080/
echo   📊 Dashboard: http://localhost:8080/dashboard
echo   🚗 Vehicles:  http://localhost:8080/vehicles
echo   📄 Documents: http://localhost:8080/documents
echo.
echo Useful commands:
echo   View logs:    docker compose logs -f
echo   Stop app:     docker compose down
echo   Check status: docker compose ps
echo.
pause
