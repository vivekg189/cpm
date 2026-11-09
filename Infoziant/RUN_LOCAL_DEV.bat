@echo off
REM VehicleVault Local Development Startup (Without Docker)
echo ========================================================
echo   VehicleVault Local Development Starter
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH!
    pause
    exit /b 1
)
echo OK: Node.js is ready.

echo.
echo [2/3] Starting Backend API on http://localhost:5000...
start "VehicleVault Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo.
echo [3/3] Starting Frontend Vite Dev Server on http://localhost:5173...
start "VehicleVault Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Services are launching in separate terminal windows!
echo ========================================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   Health:   http://localhost:5000/api/health
echo ========================================================
echo.
pause

