@echo off
REM Upload VehicleVault to EC2 using SCP
REM 
REM Prerequisites:
REM   1. You have the .pem key file
REM   2. EC2 instance is running
REM   3. You have the EC2 public IP address
REM
REM This script will upload your entire project to the EC2 instance

echo =========================================
echo   Upload VehicleVault to AWS EC2
echo =========================================
echo.

REM Get user inputs
set /p KEY_FILE="Enter path to your .pem key file (e.g., C:\Users\rushi\Downloads\vehiclevault-key.pem): "
set /p EC2_IP="Enter your EC2 public IP address: "
set /p EC2_USER="Enter EC2 username (default: ubuntu): "

REM Set default username if not provided
if "%EC2_USER%"=="" set EC2_USER=ubuntu

echo.
echo Configuration:
echo   Key File: %KEY_FILE%
echo   EC2 IP: %EC2_IP%
echo   Username: %EC2_USER%
echo.

set /p CONFIRM="Is this correct? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Upload cancelled.
    pause
    exit /b
)

echo.
echo [1/4] Testing SSH connection...
ssh -i "%KEY_FILE%" -o ConnectTimeout=10 %EC2_USER%@%EC2_IP% "echo Connection successful!"
if errorlevel 1 (
    echo ERROR: Cannot connect to EC2 instance!
    echo.
    echo Troubleshooting:
    echo   1. Verify EC2 instance is running
    echo   2. Check security group allows SSH from your IP
    echo   3. Verify key file path is correct
    echo   4. Ensure key file has proper permissions
    pause
    exit /b 1
)

echo.
echo [2/4] Creating application directory on EC2...
ssh -i "%KEY_FILE%" %EC2_USER%@%EC2_IP% "sudo mkdir -p /opt/vehiclevault && sudo chown %EC2_USER%:%EC2_USER% /opt/vehiclevault"

echo.
echo [3/4] Uploading project files to EC2...
echo This may take 2-5 minutes depending on your internet speed...
scp -i "%KEY_FILE%" -r ^
    "%~dp0backend" ^
    "%~dp0frontend" ^
    "%~dp0deploy" ^
    "%~dp0.env.example" ^
    "%~dp0.gitignore" ^
    "%~dp0compose.yaml" ^
    "%~dp0README.md" ^
    %EC2_USER%@%EC2_IP%:/opt/vehiclevault/

if errorlevel 1 (
    echo ERROR: File upload failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Setting up environment on EC2...
ssh -i "%KEY_FILE%" %EC2_USER%@%EC2_IP% "cd /opt/vehiclevault && if [ ! -f .env ]; then cp .env.example .env; echo '.env file created - YOU MUST EDIT IT!'; fi"

echo.
echo =========================================
echo   Upload Complete!
echo =========================================
echo.
echo Files uploaded to: /opt/vehiclevault on EC2
echo.
echo IMPORTANT NEXT STEPS:
echo.
echo 1. Connect to EC2:
echo    ssh -i "%KEY_FILE%" %EC2_USER%@%EC2_IP%
echo.
echo 2. Edit environment file:
echo    nano /opt/vehiclevault/.env
echo    (Change USERNAME, PASSWORD, HOST_PORT)
echo.
echo 3. Generate strong password:
echo    openssl rand -base64 32
echo.
echo 4. Install Docker (if not installed):
echo    sudo apt-get update
echo    sudo apt-get install -y docker.io docker-compose-plugin
echo.
echo 5. Start application:
echo    cd /opt/vehiclevault
echo    docker compose up --build -d
echo.
echo 6. Check status:
echo    docker compose ps
echo.
echo 7. Access application:
echo    http://%EC2_IP%/
echo.
pause
