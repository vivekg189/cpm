# 🚀 AWS EC2 Deployment Guide - VehicleVault

## Complete Step-by-Step Guide to Deploy VehicleVault on AWS EC2

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Phase 1: Launch EC2 Instance](#phase-1-launch-ec2-instance)
3. [Phase 2: Configure Security Groups](#phase-2-configure-security-groups)
4. [Phase 3: Connect to EC2](#phase-3-connect-to-ec2)
5. [Phase 4: Deploy Application](#phase-4-deploy-application)
6. [Phase 5: Verify Deployment](#phase-5-verify-deployment)
7. [Phase 6: Domain & HTTPS (Optional)](#phase-6-domain--https-optional)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance & Updates](#maintenance--updates)

---

## Prerequisites

Before starting, ensure you have:

- ✅ AWS Account (free tier eligible)
- ✅ Basic command line knowledge
- ✅ SSH client (Windows: PuTTY or Windows Terminal, Mac/Linux: built-in)
- ✅ Your project code ready (this VehicleVault application)
- ✅ (Optional) A domain name for HTTPS

**Estimated Time**: 30-45 minutes  
**Estimated Cost**: $5-15/month (t3.small instance)

---

## PHASE 1: Launch EC2 Instance

### Step 1.1: Access EC2 Dashboard

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Search for **"EC2"** in the top search bar
3. Click on **EC2** to open the EC2 Dashboard
4. Select your preferred **region** (top-right corner)
   - Recommended: Closest to your users
   - Example: `us-east-1` (N. Virginia), `ap-south-1` (Mumbai)

### Step 1.2: Launch Instance

1. Click **"Launch Instance"** (orange button)

2. **Name your instance:**
   ```
   Name: vehiclevault-production
   ```

3. **Choose AMI (Amazon Machine Image):**
   - Select **"Ubuntu Server 22.04 LTS"**
   - Architecture: **64-bit (x86)**
   - ✅ Free tier eligible

4. **Choose Instance Type:**
   ```
   Instance Type: t3.small (or t2.small for free tier)
   ```
   
   Recommendations:
   - **t2.micro** - Free tier (1 vCPU, 1GB RAM) - Good for testing
   - **t3.small** - Recommended (2 vCPU, 2GB RAM) - Better performance
   - **t3.medium** - Production (2 vCPU, 4GB RAM) - Best performance

5. **Key Pair (Login):**
   - Click **"Create new key pair"**
   - Key pair name: `vehiclevault-key`
   - Key pair type: **RSA**
   - Private key format: 
     - **Windows**: `.ppk` (for PuTTY) or `.pem` (for OpenSSH)
     - **Mac/Linux**: `.pem`
   - Click **"Create key pair"**
   - **IMPORTANT**: Save the downloaded file securely!
   - File will download as: `vehiclevault-key.pem` or `vehiclevault-key.ppk`

6. **Network Settings:**
   - Keep default VPC
   - Auto-assign public IP: **Enable**
   - Click **"Create security group"**
   - Security group name: `vehiclevault-sg`
   - Description: `Security group for VehicleVault application`
   - We'll configure rules in the next phase

7. **Configure Storage:**
   ```
   Storage: 20 GB gp3 (General Purpose SSD)
   ```
   - You can increase if you expect many PDF uploads

8. **Advanced Details:**
   - Leave all as default

9. **Review and Launch:**
   - Click **"Launch instance"** (orange button)
   - Wait for instance to be created (1-2 minutes)

10. **Note Your Instance Details:**
    - Go to **"Instances"** in left sidebar
    - Find your instance: `vehiclevault-production`
    - Note down:
      - **Instance ID**: `i-xxxxxxxxxxxxx`
      - **Public IPv4 address**: `xx.xx.xx.xx`

---

## PHASE 2: Configure Security Groups

Security groups act as a firewall for your EC2 instance.

### Step 2.1: Locate Security Group

1. In EC2 Dashboard, click **"Security Groups"** (left sidebar under "Network & Security")
2. Find **vehiclevault-sg** (the one we just created)
3. Select it and click **"Edit inbound rules"**

### Step 2.2: Add Inbound Rules

Click **"Add rule"** for each of these:

| **Type** | **Protocol** | **Port** | **Source** | **Description** |
|----------|--------------|----------|------------|-----------------|
| SSH | TCP | 22 | My IP | SSH access from your computer |
| HTTP | TCP | 80 | 0.0.0.0/0 | Public web traffic |
| HTTP | TCP | 80 | ::/0 | Public web traffic (IPv6) |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web traffic (if using SSL) |
| HTTPS | TCP | 443 | ::/0 | Secure web traffic IPv6 (if using SSL) |

**⚠️ CRITICAL SECURITY RULES:**
- ❌ **DO NOT** open port 27017 (MongoDB) - keep it internal only
- ❌ **DO NOT** open port 5000 (Backend API) - Nginx proxies it
- ✅ **ONLY** ports 22, 80, and 443 should be open to internet

### Step 2.3: Save Rules

Click **"Save rules"**

---

## PHASE 3: Connect to EC2

### Option A: Windows (Using PowerShell/Command Prompt)

1. **Open PowerShell or Command Prompt**

2. **Navigate to where you saved the key:**
   ```powershell
   cd Downloads
   ```

3. **Set proper permissions (if using .pem file):**
   ```powershell
   icacls vehiclevault-key.pem /inheritance:r
   icacls vehiclevault-key.pem /grant:r "%username%:R"
   ```

4. **Connect via SSH:**
   ```powershell
   ssh -i vehiclevault-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```
   
   Replace `YOUR_EC2_PUBLIC_IP` with your actual public IP from Phase 1.

5. **Accept fingerprint:**
   - Type `yes` and press Enter when prompted

### Option B: Windows (Using PuTTY)

1. Open **PuTTY**
2. **Host Name**: `ubuntu@YOUR_EC2_PUBLIC_IP`
3. **Port**: 22
4. Left sidebar: **Connection → SSH → Auth → Credentials**
5. **Private key file**: Browse and select `vehiclevault-key.ppk`
6. Click **"Open"**
7. Accept security alert

### Option C: Mac/Linux

1. **Open Terminal**

2. **Set proper permissions:**
   ```bash
   chmod 400 ~/Downloads/vehiclevault-key.pem
   ```

3. **Connect:**
   ```bash
   ssh -i ~/Downloads/vehiclevault-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```

4. **Accept fingerprint:**
   - Type `yes` and press Enter

### ✅ You're Connected!

You should see:
```
Welcome to Ubuntu 22.04 LTS
ubuntu@ip-xxx-xx-xx-xx:~$
```

---

## PHASE 4: Deploy Application

Now that you're connected to your EC2 instance, let's deploy the application.

### Method A: Using Automated Deployment Script (Recommended)

#### Step 4.1: Upload Your Code to GitHub (If Not Already)

**On your local Windows machine:**

1. **Initialize Git (if not already):**
   ```bash
   cd c:\Users\rushi\OneDrive\Desktop\Infoziant\Infoziant
   git init
   git add .
   git commit -m "Initial commit - VehicleVault application"
   ```

2. **Create GitHub repository:**
   - Go to https://github.com/new
   - Repository name: `vehiclevault`
   - Privacy: Public or Private (your choice)
   - Click **"Create repository"**

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/vehiclevault.git
   git branch -M main
   git push -u origin main
   ```

#### Step 4.2: Run Deployment Script on EC2

**Back on your EC2 terminal:**

1. **Download the deployment script:**
   ```bash
   wget https://raw.githubusercontent.com/YOUR_USERNAME/vehiclevault/main/deploy/scripts/ec2-deploy.sh
   chmod +x ec2-deploy.sh
   ```

   **OR** create it manually:
   ```bash
   nano deploy.sh
   ```
   
   Copy the content from `deploy/scripts/ec2-deploy.sh` and paste it.
   - Press `Ctrl+X`, then `Y`, then `Enter` to save

2. **Edit the script to add your GitHub URL:**
   ```bash
   nano deploy.sh
   ```
   
   Find this line:
   ```bash
   GITHUB_REPO="https://github.com/yourusername/vehiclevault.git"
   ```
   
   Replace with your actual repository URL.

3. **Run the script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **When prompted to edit .env:**
   ```bash
   nano /opt/vehiclevault/.env
   ```
   
   **Change these values:**
   ```env
   MONGO_INITDB_ROOT_USERNAME=vaultadmin
   MONGO_INITDB_ROOT_PASSWORD=YOUR_STRONG_PASSWORD_HERE
   MONGO_DB_NAME=vehiclevault
   MAX_UPLOAD_SIZE_MB=10
   HOST_PORT=80
   NODE_ENV=production
   ```
   
   **Generate strong password:**
   ```bash
   openssl rand -base64 32
   ```
   
   Copy the output and use it as your password.
   
   Press `Ctrl+X`, `Y`, `Enter` to save.

5. **Continue the script** (press Enter)

### Method B: Manual Deployment (Alternative)

If you prefer manual control:

#### Step 4.3: Install Docker

```bash
# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-buildx-plugin

# Start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker ubuntu

# Verify installation
docker --version
docker compose version
```

**Important**: After adding user to docker group:
```bash
# Log out and log back in
exit
# Then SSH back in
ssh -i vehiclevault-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

#### Step 4.4: Clone Repository

```bash
# Install Git
sudo apt-get install -y git

# Create app directory
sudo mkdir -p /opt/vehiclevault
sudo chown ubuntu:ubuntu /opt/vehiclevault

# Clone repository
git clone https://github.com/YOUR_USERNAME/vehiclevault.git /opt/vehiclevault
cd /opt/vehiclevault
```

#### Step 4.5: Configure Environment

```bash
# Copy example env
cp .env.example .env

# Edit .env
nano .env
```

**Set these values:**
```env
MONGO_INITDB_ROOT_USERNAME=vaultadmin
MONGO_INITDB_ROOT_PASSWORD=<use-openssl-rand-base64-32>
MONGO_DB_NAME=vehiclevault
MAX_UPLOAD_SIZE_MB=10
HOST_PORT=80
NODE_ENV=production
```

Generate password:
```bash
openssl rand -base64 32
```

Save: `Ctrl+X`, `Y`, `Enter`

#### Step 4.6: Start Application

```bash
cd /opt/vehiclevault
docker compose up --build -d
```

Wait for build to complete (3-5 minutes first time).

#### Step 4.7: Verify Services

```bash
docker compose ps
```

All services should show `healthy` status.

---

## PHASE 5: Verify Deployment

### Step 5.1: Check Service Status

```bash
cd /opt/vehiclevault
docker compose ps
```

Expected output:
```
NAME                   STATUS
vehiclevault-backend   Up X minutes (healthy)
vehiclevault-frontend  Up X minutes (healthy)
vehiclevault-mongodb   Up X minutes (healthy)
```

### Step 5.2: Test API Health

```bash
curl http://localhost/api/health
```

Should return JSON:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

### Step 5.3: Access from Browser

Open your browser and go to:
```
http://YOUR_EC2_PUBLIC_IP/
```

Replace `YOUR_EC2_PUBLIC_IP` with your actual IP.

You should see the **VehicleVault application**! 🎉

### Step 5.4: Test All Pages

- Dashboard: `http://YOUR_EC2_PUBLIC_IP/dashboard`
- Vehicles: `http://YOUR_EC2_PUBLIC_IP/vehicles`
- Documents: `http://YOUR_EC2_PUBLIC_IP/documents`
- System Status: `http://YOUR_EC2_PUBLIC_IP/status`

---

## PHASE 6: Domain & HTTPS (Optional)

### Prerequisites
- A registered domain name (e.g., from Namecheap, GoDaddy, or AWS Route 53)

### Step 6.1: Configure DNS

1. Go to your domain registrar's DNS settings
2. Add an **A Record**:
   ```
   Type: A
   Name: @ (or vehiclevault)
   Value: YOUR_EC2_PUBLIC_IP
   TTL: 300 (or default)
   ```
3. Wait 5-15 minutes for DNS propagation
4. Verify: `ping yourdomain.com`

### Step 6.2: Install Certbot

```bash
# Stop application temporarily
cd /opt/vehiclevault
docker compose down

# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot

# Get SSL certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --agree-tos \
  --email your-email@example.com

# Certificates saved at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Step 6.3: Configure Nginx with SSL

```bash
# Install Nginx on host
sudo apt-get install -y nginx

# Copy production config
sudo cp /opt/vehiclevault/deploy/nginx/vehiclevault.conf /etc/nginx/sites-available/vehiclevault

# Edit config
sudo nano /etc/nginx/sites-available/vehiclevault
```

Replace `vehiclevault.example.com` with your actual domain.

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/vehiclevault /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Update .env to use internal port
nano /opt/vehiclevault/.env
# Change: HOST_PORT=8080

# Restart application
cd /opt/vehiclevault
docker compose up -d

# Test and reload Nginx
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Step 6.4: Set Up Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Check timer
sudo systemctl status certbot.timer
```

### Step 6.5: Access via HTTPS

Open browser:
```
https://yourdomain.com/
```

---

## Troubleshooting

### Issue: Can't connect via SSH

**Solution:**
- Check security group allows port 22 from your IP
- Verify you're using correct .pem file
- Ensure key has proper permissions
- Try: `ssh -v -i key.pem ubuntu@IP` for verbose output

### Issue: Application not accessible from browser

**Solution:**
```bash
# Check if services are running
docker compose ps

# Check logs
docker compose logs -f

# Restart services
docker compose restart

# Verify security group allows port 80
```

### Issue: Port 80 permission denied

**Solution:**
```bash
# Check if another service is using port 80
sudo lsof -i :80

# If needed, change to port 8080 in .env
nano /opt/vehiclevault/.env
# Set: HOST_PORT=8080
docker compose up -d

# Access via: http://YOUR_IP:8080
```

### Issue: MongoDB connection errors

**Solution:**
```bash
# Check MongoDB logs
docker compose logs mongodb

# Verify .env has correct credentials
cat /opt/vehiclevault/.env

# Restart backend
docker compose restart backend
```

### Issue: Out of disk space

**Solution:**
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
docker volume prune

# Clean up old images
docker image prune -a
```

---

## Maintenance & Updates

### View Logs

```bash
cd /opt/vehiclevault

# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs --tail=100 mongodb
```

### Update Application

```bash
cd /opt/vehiclevault

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up --build -d

# Verify
docker compose ps
```

### Backup Data

```bash
# Create backup directory
sudo mkdir -p /backup

# Backup uploaded documents
docker run --rm \
  -v vehiclevault_vehicle_documents:/src \
  -v /backup:/dest \
  alpine tar czf /dest/uploads-$(date +%Y%m%d-%H%M%S).tar.gz -C /src .

# Backup MongoDB
docker exec vehiclevault-mongodb mongodump \
  --username vaultadmin \
  --password YOUR_PASSWORD \
  --authenticationDatabase admin \
  --db vehiclevault \
  --archive > /backup/mongodb-$(date +%Y%m%d-%H%M%S).dump

# Download to your local machine
# On your local Windows machine:
scp -i vehiclevault-key.pem ubuntu@YOUR_EC2_IP:/backup/*.tar.gz .
scp -i vehiclevault-key.pem ubuntu@YOUR_EC2_IP:/backup/*.dump .
```

### Monitor Resources

```bash
# Check container stats
docker compose stats

# Check disk usage
df -h

# Check memory
free -h

# Check system load
top
```

### Stop Application

```bash
cd /opt/vehiclevault
docker compose down
```

**Note:** Data is safe in volumes

### Restart Application

```bash
cd /opt/vehiclevault
docker compose up -d
```

---

## 💰 Cost Estimation

| Resource | Specification | Monthly Cost |
|----------|--------------|--------------|
| EC2 t3.small | 2 vCPU, 2GB RAM | ~$15 |
| EBS Storage | 20 GB gp3 | ~$2 |
| Data Transfer | First 1 GB free, then $0.09/GB | Variable |
| **Total** | | **~$17-25/month** |

**Cost Saving Tips:**
- Use t2.micro for testing (free tier: 750 hours/month for 1 year)
- Stop instance when not in use (you still pay for storage)
- Use Reserved Instances for long-term (up to 72% savings)

---

## 🔒 Security Best Practices

- ✅ Change MongoDB credentials regularly
- ✅ Enable HTTPS with valid SSL certificate
- ✅ Keep system updated: `sudo apt-get update && sudo apt-get upgrade`
- ✅ Use AWS Systems Manager Session Manager instead of SSH (no open port 22)
- ✅ Set up CloudWatch alarms for monitoring
- ✅ Enable automated backups
- ✅ Use AWS Secrets Manager for sensitive data
- ✅ Implement rate limiting (already in app)
- ✅ Add authentication before exposing publicly (see README security limitations)

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Verify security groups allow required ports
3. Ensure .env file has correct values
4. Check AWS service health dashboard
5. Review this guide's troubleshooting section

---

## ✅ Deployment Checklist

- [ ] EC2 instance launched (Ubuntu 22.04)
- [ ] Security group configured (ports 22, 80, 443)
- [ ] SSH connection successful
- [ ] Docker installed and running
- [ ] Application code deployed
- [ ] .env file configured with strong passwords
- [ ] Application started successfully
- [ ] All services showing "healthy" status
- [ ] Application accessible from browser
- [ ] (Optional) Domain configured
- [ ] (Optional) HTTPS enabled with SSL certificate
- [ ] Backup strategy implemented
- [ ] Monitoring configured

---

**🎉 Congratulations! Your VehicleVault application is now live on AWS EC2!**

Access it at: `http://YOUR_EC2_PUBLIC_IP/`
