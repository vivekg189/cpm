@echo off
REM VehicleVault Application Log Viewer
REM Run this script to view real-time logs from all services

echo ========================================
echo   VehicleVault Application Logs
echo ========================================
echo.
echo Press Ctrl+C to stop viewing logs
echo.

cd /d "%~dp0"

docker compose logs -f
