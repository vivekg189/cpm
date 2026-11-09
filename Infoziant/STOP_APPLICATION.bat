@echo off
REM VehicleVault Application Stop Script
REM Run this script to stop the application (data is preserved)

echo ========================================
echo   VehicleVault Application Stopper
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Stopping all services...
docker compose down

echo.
echo [2/2] Verifying containers are stopped...
docker compose ps

echo.
echo ========================================
echo   Application Stopped Successfully!
echo ========================================
echo.
echo Your data is safe in Docker volumes:
echo   - vehiclevault_vehicle_documents
echo   - vehiclevault_mongodb_data
echo.
echo To restart: Double-click START_APPLICATION.bat
echo.
pause
