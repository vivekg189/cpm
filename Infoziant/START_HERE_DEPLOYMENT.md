# 🚀 START HERE - AWS EC2 Deployment Guide

## Welcome! This guide will help you deploy VehicleVault to AWS EC2.

---

## 📚 **Choose Your Learning Style**

We've created multiple guides to suit different preferences:

### 1️⃣ **Quick Deployer** ⚡ (Experienced users)
**Best for:** You've deployed to AWS before and just need a checklist  
**Time:** 20-25 minutes  
**Read:** `QUICK_DEPLOYMENT_CHECKLIST.md`

### 2️⃣ **Visual Learner** 🗺️ (See the big picture)
**Best for:** You want to understand the full deployment flow  
**Time:** 5 minutes to read, 30-40 minutes to deploy  
**Read:** `DEPLOYMENT_FLOWCHART.md`

### 3️⃣ **Detailed Learner** 📖 (Step-by-step instructions)
**Best for:** First-time AWS users or want comprehensive explanations  
**Time:** 45-60 minutes with detailed reading  
**Read:** `AWS_EC2_DEPLOYMENT_GUIDE.md` ⭐ **RECOMMENDED FOR FIRST-TIME DEPLOYERS**

---

## 🎯 **What You'll Need**

Before starting, make sure you have:

- [ ] **AWS Account** (free tier available)
  - Sign up: https://aws.amazon.com/free/
  - Credit card required (charges ~$15-25/month)

- [ ] **SSH Client** (to connect to server)
  - Windows: Built into PowerShell (Windows 10+)
  - Mac/Linux: Built-in terminal

- [ ] **Your Key File** (will be created during setup)
  - AWS will provide this: `vehiclevault-key.pem`

- [ ] **30-60 minutes** of uninterrupted time

- [ ] **Basic command line knowledge** (helpful but not required)

---

## 🚦 **Quick Start - 3 Simple Steps**

### Step 1: Read the Guide (5 minutes)
Choose one guide above and read it completely before starting.

### Step 2: Launch EC2 & Configure (15 minutes)
Follow your chosen guide to:
- Create EC2 instance
- Configure security groups
- Connect via SSH

### Step 3: Deploy Application (15 minutes)
Run deployment commands on EC2:
```bash
# Automated deployment (recommended)
wget https://raw.githubusercontent.com/YOUR_USERNAME/vehiclevault/main/deploy/scripts/ec2-deploy.sh
chmod +x ec2-deploy.sh
./ec2-deploy.sh
```

### Step 4: Access Your Application ✅
Open browser: `http://YOUR_EC2_IP/`

---

## 🛠️ **Helper Tools We've Created**

### For Windows Users:

1. **`UPLOAD_TO_EC2.bat`** 
   - Automatically upload your code to EC2
   - No need to use GitHub
   - Double-click to run

2. **`START_APPLICATION.bat`** 
   - Start application locally for testing
   - Before deploying to AWS

3. **`STOP_APPLICATION.bat`**
   - Stop local application

4. **`VIEW_LOGS.bat`**
   - View application logs

### For EC2 Server:

1. **`deploy/scripts/ec2-deploy.sh`**
   - Complete automated deployment
   - Installs everything needed
   - Run on EC2 after connecting

2. **`deploy/scripts/deploy.sh`**
   - Alternative deployment script
   - More customizable

---

## 📋 **Deployment Methods**

### Method A: GitHub Repository (Recommended) ⭐

**Pros:** Easy updates, version control, standard practice  
**Steps:**
1. Push code to GitHub
2. SSH into EC2
3. Run deployment script
4. Script clones from GitHub

**Time:** 25-35 minutes

### Method B: Direct Upload (Alternative)

**Pros:** No GitHub needed, works offline  
**Steps:**
1. Run `UPLOAD_TO_EC2.bat` on Windows
2. SSH into EC2
3. Run deployment script
4. Code already on server

**Time:** 25-35 minutes

---

## 💰 **Cost Information**

### EC2 Instance Options:

| Instance Type | vCPU | RAM | Cost/Month | Best For |
|---------------|------|-----|------------|----------|
| t2.micro | 1 | 1GB | **FREE** (1 year) | Testing only |
| t3.small | 2 | 2GB | ~$15 | Development |
| t3.medium | 2 | 4GB | ~$30 | Production |

### Total Monthly Cost:
- **Instance**: $15-30
- **Storage (20GB)**: $2
- **Data Transfer**: $0-5
- **Total**: **$17-37/month**

### Free Tier:
- 750 hours/month free for 1 year (t2.micro)
- 30GB storage free
- 1GB data transfer free

---

## 🎓 **Deployment Process Overview**

```
Local Computer                    AWS Cloud
─────────────                     ─────────
                                         
1. Create EC2  ──────────────────► EC2 Instance
   Instance                        (Ubuntu Server)
                                         │
2. Configure  ──────────────────► Security Groups
   Firewall                        (Ports 22,80,443)
                                         │
3. Connect    ──────SSH──────────► Terminal Access
   via SSH                               │
                                         │
4. Install    ─────Commands──────► Docker Installed
   Docker                                │
                                         │
5. Deploy     ─────Commands──────► App Running
   Application                           │
                                         │
6. Access     ◄────HTTP/HTTPS────  Public Internet
   via Browser                     (Your IP Address)
```

---

## ✅ **Verification Checklist**

After deployment, verify these:

- [ ] Can SSH into EC2 instance
- [ ] Docker is installed and running
- [ ] All 3 containers show "healthy" status
- [ ] API health endpoint returns JSON: `curl http://localhost/api/health`
- [ ] Can access web interface: `http://YOUR_EC2_IP/`
- [ ] Can navigate to all pages (Dashboard, Vehicles, Documents)
- [ ] Can create a test vehicle
- [ ] Can upload a test document
- [ ] Security groups properly configured (only 22, 80, 443 open)

---

## 🐛 **Common Issues & Quick Fixes**

### Issue 1: Can't SSH to EC2
```
✓ Check: EC2 instance is running (AWS Console)
✓ Check: Security group allows port 22 from your IP
✓ Check: Using correct .pem key file
✓ Fix: ssh -i vehiclevault-key.pem ubuntu@YOUR_EC2_IP
```

### Issue 2: Services Not Healthy
```
✓ Check: docker compose ps
✓ Check: docker compose logs -f
✓ Fix: Verify .env file has correct credentials
✓ Fix: docker compose restart
```

### Issue 3: Can't Access from Browser
```
✓ Check: Security group allows port 80 from 0.0.0.0/0
✓ Check: docker compose ps shows all healthy
✓ Check: curl http://localhost/api/health works on EC2
✓ Fix: Edit security group inbound rules
```

### Issue 4: Port 80 Permission Denied
```
✓ Fix: Change HOST_PORT=8080 in .env
✓ Fix: docker compose up -d
✓ Access: http://YOUR_EC2_IP:8080/
```

---

## 📞 **Getting Help**

### Before Deployment:
1. Read: `AWS_EC2_DEPLOYMENT_GUIDE.md` (most comprehensive)
2. Check: `QUICK_DEPLOYMENT_CHECKLIST.md` (quick reference)
3. View: `DEPLOYMENT_FLOWCHART.md` (visual guide)

### During Deployment:
1. Check container logs: `docker compose logs -f`
2. Verify status: `docker compose ps`
3. Test API: `curl http://localhost/api/health`

### After Deployment:
1. Monitor resources: `docker compose stats`
2. View system resources: `df -h` (disk), `free -h` (memory)
3. Update application: See "Maintenance & Updates" section

---

## 🎯 **Recommended Path for First-Time Deployers**

### Phase 1: Preparation (10 minutes)
1. ✅ Read this file completely
2. ✅ Read `AWS_EC2_DEPLOYMENT_GUIDE.md` sections 1-5
3. ✅ Prepare AWS account and payment method
4. ✅ Have your project code ready

### Phase 2: AWS Setup (15 minutes)
1. ✅ Launch EC2 instance
2. ✅ Configure security groups
3. ✅ Download and save .pem key file
4. ✅ Note public IP address

### Phase 3: Deployment (20 minutes)
1. ✅ Connect via SSH
2. ✅ Run deployment script
3. ✅ Configure .env file
4. ✅ Wait for build to complete

### Phase 4: Verification (5 minutes)
1. ✅ Check container status
2. ✅ Test API endpoint
3. ✅ Access via browser
4. ✅ Test all functionality

### Phase 5: Optional - Domain & HTTPS (30 minutes)
1. ✅ Configure domain name
2. ✅ Install SSL certificate
3. ✅ Enable HTTPS access

---

## 🎉 **After Successful Deployment**

Your application will be live at:
- **Main Application**: `http://YOUR_EC2_IP/`
- **Dashboard**: `http://YOUR_EC2_IP/dashboard`
- **Vehicles**: `http://YOUR_EC2_IP/vehicles`
- **Documents**: `http://YOUR_EC2_IP/documents`
- **API Health**: `http://YOUR_EC2_IP/api/health`

---

## 📈 **Next Steps After Deployment**

### Immediate (Required):
- [ ] Test all functionality thoroughly
- [ ] Create backup of initial state
- [ ] Document your EC2 IP and credentials

### Short-term (Recommended):
- [ ] Configure domain name
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up automated backups
- [ ] Configure monitoring/alerts

### Long-term (Best Practices):
- [ ] Add user authentication
- [ ] Implement rate limiting
- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling
- [ ] Enable CloudWatch logging

---

## 🔒 **Security Reminders**

⚠️ **CRITICAL SECURITY NOTES:**

1. **Never commit .env to Git** (already in .gitignore)
2. **Use strong MongoDB password** (generate with `openssl rand -base64 32`)
3. **Only open required ports** (22, 80, 443)
4. **Keep system updated** (`sudo apt-get update && sudo apt-get upgrade`)
5. **Add authentication** before exposing to production users
6. **Enable HTTPS** for production use
7. **Regular backups** of data volumes
8. **Monitor access logs** for suspicious activity

---

## 📖 **Full Documentation Index**

| Document | Purpose | When to Use |
|----------|---------|-------------|
| `START_HERE_DEPLOYMENT.md` | This file - overview | Start here first |
| `AWS_EC2_DEPLOYMENT_GUIDE.md` | Complete detailed guide | First-time deployment |
| `QUICK_DEPLOYMENT_CHECKLIST.md` | Quick reference | Experienced users |
| `DEPLOYMENT_FLOWCHART.md` | Visual process map | Understand workflow |
| `README.md` | Project documentation | Understand application |
| `UPLOAD_TO_EC2.bat` | Upload helper (Windows) | Transfer files to EC2 |
| `deploy/scripts/ec2-deploy.sh` | Automated deployment | Run on EC2 |

---

## ✨ **Ready to Deploy?**

1. **Choose your guide** from the options at the top
2. **Set aside 30-60 minutes** of focused time
3. **Open AWS Console**: https://console.aws.amazon.com/
4. **Follow your chosen guide** step-by-step
5. **Don't rush** - read each step carefully

---

## 🎊 **You've Got This!**

Deploying to AWS might seem intimidating, but we've broken it down into simple steps. Thousands of developers deploy applications daily, and with these guides, you'll be one of them!

**Important:** If you get stuck at any point:
1. Don't panic - it's normal!
2. Read the troubleshooting section
3. Check the logs: `docker compose logs -f`
4. Verify each step was completed correctly
5. Start with a fresh EC2 instance if needed (it's okay!)

---

**Good luck with your deployment! 🚀**

---

*Last Updated: Your deployment date*  
*Estimated Total Time: 30-60 minutes*  
*Difficulty Level: Beginner to Intermediate*
