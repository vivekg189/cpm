#!/usr/bin/env bash
# ec2-deploy.sh - Complete deployment script for AWS EC2 Ubuntu instance
# This script will be run ON the EC2 instance after you SSH into it
# 
# Usage:
#   chmod +x ec2-deploy.sh
#   ./ec2-deploy.sh

set -euo pipefail

echo "=========================================="
echo "   VehicleVault EC2 Deployment Script"
echo "=========================================="
echo ""

# Configuration
APP_DIR="/opt/vehiclevault"
GITHUB_REPO="https://github.com/yourusername/vehiclevault.git"  # CHANGE THIS

# Step 1: Update system packages
echo "[1/8] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
echo "✓ System updated"

# Step 2: Install Docker
echo ""
echo "[2/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-buildx-plugin
    
    # Start and enable Docker
    sudo systemctl enable docker
    sudo systemctl start docker
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo "✓ Docker installed successfully"
    echo "⚠️  You need to log out and log back in for docker group changes to take effect"
    echo "   After logging back in, run this script again."
    exit 0
else
    echo "✓ Docker already installed"
fi

# Verify Docker is working
docker --version
docker compose version

# Step 3: Install Git (if not already installed)
echo ""
echo "[3/8] Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
    echo "✓ Git installed"
else
    echo "✓ Git already installed"
fi

# Step 4: Create application directory
echo ""
echo "[4/8] Setting up application directory..."
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
    echo "✓ Directory created: $APP_DIR"
else
    echo "✓ Directory already exists: $APP_DIR"
fi

# Step 5: Clone or update repository
echo ""
echo "[5/8] Cloning/updating repository..."
if [ -d "$APP_DIR/.git" ]; then
    echo "Repository exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main || git pull origin master
else
    echo "Cloning repository..."
    git clone "$GITHUB_REPO" "$APP_DIR"
    cd "$APP_DIR"
fi
echo "✓ Repository ready"

# Step 6: Configure environment
echo ""
echo "[6/8] Configuring environment..."
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo "⚠️  IMPORTANT: Edit $APP_DIR/.env and set secure credentials!"
    echo ""
    echo "Required changes in .env file:"
    echo "  - MONGO_INITDB_ROOT_USERNAME (set a username)"
    echo "  - MONGO_INITDB_ROOT_PASSWORD (generate strong password)"
    echo "  - HOST_PORT=80 (or 443 for HTTPS)"
    echo ""
    echo "Generate a strong password with:"
    echo "  openssl rand -base64 32"
    echo ""
    read -p "Press Enter after you've edited the .env file..."
else
    echo "✓ .env file already exists"
fi

# Step 7: Start the application
echo ""
echo "[7/8] Starting Docker containers..."
cd "$APP_DIR"
docker compose up --build -d

echo "✓ Containers started"

# Step 8: Wait for services to be healthy
echo ""
echo "[8/8] Waiting for services to be healthy (this may take 30-60 seconds)..."
sleep 30
docker compose ps

# Final checks
echo ""
echo "=========================================="
echo "   Deployment Complete!"
echo "=========================================="
echo ""

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "Unable to fetch")

echo "Your application is deployed!"
echo ""
echo "Access URLs:"
echo "  🌐 Application:  http://$PUBLIC_IP/"
echo "  📊 Dashboard:    http://$PUBLIC_IP/dashboard"
echo "  🔍 Health Check: http://$PUBLIC_IP/api/health"
echo ""
echo "Useful commands:"
echo "  View logs:       cd $APP_DIR && docker compose logs -f"
echo "  Stop app:        cd $APP_DIR && docker compose down"
echo "  Start app:       cd $APP_DIR && docker compose up -d"
echo "  Check status:    cd $APP_DIR && docker compose ps"
echo "  Update app:      cd $APP_DIR && git pull && docker compose up --build -d"
echo ""
echo "Next steps for production:"
echo "  1. Configure a domain name and point it to: $PUBLIC_IP"
echo "  2. Install SSL certificate with Certbot (see README.md)"
echo "  3. Set up automated backups"
echo "  4. Configure monitoring"
echo ""
