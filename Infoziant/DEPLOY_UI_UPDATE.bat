@echo off
echo ========================================
echo   VehicleVault - Deploy UI Update
echo ========================================
echo.

echo Step 1: Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 2: Testing build...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 3: Adding changes to git...
git add .
git status

echo.
echo ========================================
echo   Ready to commit and push!
echo ========================================
echo.
echo Next steps:
echo 1. Review changes above
echo 2. Run: git commit -m "Update UI to white theme with icons"
echo 3. Run: git push origin master
echo 4. SSH to EC2 and run: cd /opt/vehiclevault && git pull && docker compose up --build -d
echo.
pause
