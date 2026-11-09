# 🗺️ AWS EC2 Deployment Flowchart

## Visual Guide to Deployment Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    START: AWS EC2 DEPLOYMENT                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: AWS CONSOLE SETUP                                     │
│  ═══════════════════════════════════════                        │
│  1. Log into AWS Console                                        │
│  2. Navigate to EC2 Dashboard                                   │
│  3. Select Region (e.g., us-east-1)                            │
│  4. Click "Launch Instance"                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: INSTANCE CONFIGURATION                                │
│  ═══════════════════════════════════                            │
│  ✓ Name: vehiclevault-production                               │
│  ✓ AMI: Ubuntu Server 22.04 LTS                                │
│  ✓ Instance Type: t3.small (2 vCPU, 2GB RAM)                   │
│  ✓ Key Pair: Create new "vehiclevault-key"                     │
│  ✓ Storage: 20 GB gp3 SSD                                       │
│  ✓ Click "Launch Instance"                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: SECURITY GROUP SETUP                                  │
│  ═══════════════════════════════════                            │
│  Configure Inbound Rules:                                       │
│  ┌──────────┬──────────┬────────────────┐                      │
│  │ Type     │ Port     │ Source         │                      │
│  ├──────────┼──────────┼────────────────┤                      │
│  │ SSH      │ 22       │ My IP          │                      │
│  │ HTTP     │ 80       │ 0.0.0.0/0      │                      │
│  │ HTTPS    │ 443      │ 0.0.0.0/0      │                      │
│  └──────────┴──────────┴────────────────┘                      │
│  ❌ DO NOT open: 27017 (MongoDB), 5000 (Backend)               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: SAVE INSTANCE DETAILS                                 │
│  ═══════════════════════════════════════                        │
│  📝 Note down:                                                  │
│     • Instance ID: i-xxxxxxxxxxxxx                             │
│     • Public IPv4: xx.xx.xx.xx                                 │
│     • Key file location: vehiclevault-key.pem                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  DECISION: How to upload code?                                  │
└───┬─────────────────────────────────────────────────────────┬───┘
    │                                                           │
    │ Option A: GitHub                                          │ Option B: Direct Upload
    │                                                           │
    ▼                                                           ▼
┌────────────────────────────────┐    ┌─────────────────────────────────┐
│ Push code to GitHub:           │    │ Use UPLOAD_TO_EC2.bat:          │
│ 1. git init                    │    │ 1. Run script                   │
│ 2. git add .                   │    │ 2. Provide key file path        │
│ 3. git commit -m "Initial"     │    │ 3. Enter EC2 IP                 │
│ 4. Create GitHub repo          │    │ 4. Files upload automatically   │
│ 5. git push origin main        │    │                                 │
└────────────┬───────────────────┘    └──────────────┬──────────────────┘
             │                                        │
             └────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: CONNECT TO EC2 VIA SSH                                │
│  ═══════════════════════════════════                            │
│  Windows PowerShell:                                            │
│  ssh -i vehiclevault-key.pem ubuntu@YOUR_EC2_IP                 │
│                                                                 │
│  First connection:                                              │
│  • Type "yes" to accept fingerprint                            │
│  • You should see: ubuntu@ip-xxx-xx-xx-xx:~$                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6: INSTALL DOCKER                                        │
│  ═══════════════════════                                        │
│  # Update system                                                │
│  sudo apt-get update -y                                         │
│  sudo apt-get upgrade -y                                        │
│                                                                 │
│  # Install Docker                                               │
│  sudo apt-get install -y ca-certificates curl                   │
│  curl -fsSL https://get.docker.com | sudo sh                    │
│  sudo systemctl enable docker                                   │
│  sudo systemctl start docker                                    │
│  sudo usermod -aG docker ubuntu                                 │
│                                                                 │
│  # Log out and back in for group changes                        │
│  exit                                                           │
│  ssh -i vehiclevault-key.pem ubuntu@YOUR_EC2_IP                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 7: GET APPLICATION CODE                                  │
│  ═══════════════════════════════                                │
│                                                                 │
│  If using GitHub:                                               │
│  ┌────────────────────────────────────────────────┐            │
│  │ git clone YOUR_GITHUB_URL /opt/vehiclevault    │            │
│  │ cd /opt/vehiclevault                            │            │
│  └────────────────────────────────────────────────┘            │
│                                                                 │
│  If uploaded directly:                                          │
│  ┌────────────────────────────────────────────────┐            │
│  │ Code already at /opt/vehiclevault               │            │
│  │ cd /opt/vehiclevault                            │            │
│  └────────────────────────────────────────────────┘            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 8: CONFIGURE ENVIRONMENT                                 │
│  ═══════════════════════════════                                │
│  # Copy example file                                            │
│  cp .env.example .env                                           │
│                                                                 │
│  # Generate strong password                                     │
│  openssl rand -base64 32                                        │
│  (Save this output!)                                            │
│                                                                 │
│  # Edit .env file                                               │
│  nano .env                                                      │
│                                                                 │
│  Required changes:                                              │
│  ┌──────────────────────────────────────────────┐              │
│  │ MONGO_INITDB_ROOT_USERNAME=vaultadmin        │              │
│  │ MONGO_INITDB_ROOT_PASSWORD=<paste-password>  │              │
│  │ MONGO_DB_NAME=vehiclevault                   │              │
│  │ HOST_PORT=80                                  │              │
│  │ NODE_ENV=production                           │              │
│  │ MAX_UPLOAD_SIZE_MB=10                         │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  Save: Ctrl+X, Y, Enter                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 9: START APPLICATION                                     │
│  ═══════════════════════                                        │
│  cd /opt/vehiclevault                                           │
│  docker compose up --build -d                                   │
│                                                                 │
│  ⏱️  This will take 5-10 minutes on first run:                 │
│     • Building frontend Docker image                           │
│     • Building backend Docker image                            │
│     • Pulling MongoDB image                                    │
│     • Starting all containers                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 10: VERIFY DEPLOYMENT                                    │
│  ═══════════════════════════════                                │
│  # Check container status                                       │
│  docker compose ps                                              │
│                                                                 │
│  Expected output:                                               │
│  ┌─────────────────────────────────────────────┐               │
│  │ NAME                  STATUS                │               │
│  │ vehiclevault-backend  Up (healthy) ✓        │               │
│  │ vehiclevault-frontend Up (healthy) ✓        │               │
│  │ vehiclevault-mongodb  Up (healthy) ✓        │               │
│  └─────────────────────────────────────────────┘               │
│                                                                 │
│  # Test API health                                              │
│  curl http://localhost/api/health                               │
│                                                                 │
│  Should return: {"status":"ok",...}                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 11: ACCESS FROM BROWSER                                  │
│  ═══════════════════════════════                                │
│  Open your web browser and visit:                              │
│                                                                 │
│  🌐 http://YOUR_EC2_PUBLIC_IP/                                  │
│                                                                 │
│  You should see:                                                │
│  ┌──────────────────────────────────────────────┐              │
│  │                                               │              │
│  │        🚗 VehicleVault                        │              │
│  │                                               │              │
│  │     Vehicle Document Management System        │              │
│  │                                               │              │
│  │  [Dashboard] [Vehicles] [Documents] [Status]  │              │
│  │                                               │              │
│  └──────────────────────────────────────────────┘              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ✅ SUCCESS! APPLICATION IS LIVE                                │
│  ═══════════════════════════════════════                        │
│                                                                 │
│  Your URLs:                                                     │
│  • Main App:  http://YOUR_EC2_IP/                              │
│  • Dashboard: http://YOUR_EC2_IP/dashboard                     │
│  • Vehicles:  http://YOUR_EC2_IP/vehicles                      │
│  • Documents: http://YOUR_EC2_IP/documents                     │
│  • Health:    http://YOUR_EC2_IP/api/health                    │
│                                                                 │
│  Monthly Cost: ~$15-25 (t3.small)                              │
│  Data: Persists in Docker volumes                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  OPTIONAL: DOMAIN & HTTPS SETUP                                 │
│  ═══════════════════════════════════                            │
│  1. Purchase domain (e.g., vehiclevault.com)                   │
│  2. Add A Record → YOUR_EC2_IP                                  │
│  3. Install Certbot:                                            │
│     sudo apt-get install -y certbot                             │
│  4. Get SSL certificate:                                        │
│     sudo certbot certonly --standalone -d yourdomain.com        │
│  5. Configure Nginx with SSL                                    │
│  6. Access via: https://yourdomain.com                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ONGOING MAINTENANCE                                            │
│  ═══════════════════════                                        │
│                                                                 │
│  View Logs:                                                     │
│  docker compose logs -f                                         │
│                                                                 │
│  Update Application:                                            │
│  cd /opt/vehiclevault                                           │
│  git pull                                                       │
│  docker compose up --build -d                                   │
│                                                                 │
│  Backup Data:                                                   │
│  See AWS_EC2_DEPLOYMENT_GUIDE.md                                │
│                                                                 │
│  Monitor Resources:                                             │
│  docker compose stats                                           │
│  df -h                                                          │
│  free -h                                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Time Breakdown

| Phase | Task | Duration |
|-------|------|----------|
| 1-4 | AWS Console Setup | 5-10 min |
| 5 | Connect SSH | 1-2 min |
| 6 | Install Docker | 3-5 min |
| 7 | Get Code | 1-2 min |
| 8 | Configure .env | 2-3 min |
| 9 | Build & Start | 5-10 min |
| 10-11 | Verify & Access | 1-2 min |
| **TOTAL** | **First Time** | **20-35 min** |

## 🚨 Common Stopping Points

### ⚠️ Issue 1: SSH Connection Failed
- **Symptom**: Can't connect to EC2
- **Solution**: Check security group allows port 22 from your IP
- **Jump to**: Phase 3

### ⚠️ Issue 2: Services Not Healthy
- **Symptom**: `docker compose ps` shows unhealthy
- **Solution**: Check logs with `docker compose logs -f`
- **Common causes**: .env misconfigured, port conflicts
- **Jump to**: Phase 8

### ⚠️ Issue 3: Can't Access from Browser
- **Symptom**: Browser shows "connection refused"
- **Solution**: Check security group allows port 80
- **Jump to**: Phase 3

### ⚠️ Issue 4: Port 80 Permission Denied
- **Symptom**: Error binding to port 80
- **Solution**: Change HOST_PORT=8080 in .env
- **Jump to**: Phase 8

## 📊 Success Indicators at Each Phase

| Phase | Success Indicator |
|-------|-------------------|
| 2 | Instance state: "Running" (green) |
| 3 | Security group rules saved |
| 5 | See: `ubuntu@ip-xxx-xx-xx-xx:~$` |
| 6 | `docker --version` returns version |
| 7 | `ls /opt/vehiclevault` shows files |
| 8 | `cat .env` shows your credentials |
| 9 | `docker compose ps` runs without error |
| 10 | All 3 services show "(healthy)" |
| 11 | Browser shows VehicleVault interface |

## 🎓 Learning Resources

- **AWS EC2 Basics**: https://aws.amazon.com/ec2/getting-started/
- **Docker Compose**: https://docs.docker.com/compose/
- **SSH Tutorial**: https://www.ssh.com/academy/ssh/command
- **Linux Basics**: https://ubuntu.com/tutorials/command-line-for-beginners

---

**Need detailed instructions?** See: `AWS_EC2_DEPLOYMENT_GUIDE.md`  
**Need quick reference?** See: `QUICK_DEPLOYMENT_CHECKLIST.md`  
**Need to upload files?** Run: `UPLOAD_TO_EC2.bat`
