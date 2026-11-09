# ⚡ Quick EC2 Deployment Checklist

## 📝 Before You Start
- [ ] AWS account ready
- [ ] Credit card linked (for charges)
- [ ] SSH client installed
- [ ] Code pushed to GitHub (optional but recommended)

---

## 🚀 5-Step Quick Deploy

### 1️⃣ Launch EC2 Instance (5 min)
```
✓ EC2 Console → Launch Instance
✓ Name: vehiclevault-production
✓ AMI: Ubuntu 22.04 LTS
✓ Instance: t3.small (or t2.micro for free tier)
✓ Key pair: Create new → vehiclevault-key.pem
✓ Storage: 20 GB
✓ Launch!
✓ Note: Public IP address
```

### 2️⃣ Configure Security (2 min)
```
✓ Security Groups → vehiclevault-sg
✓ Add rules:
  - SSH (22) from My IP
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0
✓ Save rules
```

### 3️⃣ Connect via SSH (2 min)
**Windows PowerShell:**
```powershell
ssh -i vehiclevault-key.pem ubuntu@YOUR_EC2_IP
```

**Accept fingerprint:** Type `yes`

### 4️⃣ Run Deployment Script (10 min)
```bash
# Option A: Automated (Recommended)
wget https://raw.githubusercontent.com/YOUR_USERNAME/vehiclevault/main/deploy/scripts/ec2-deploy.sh
chmod +x ec2-deploy.sh
./ec2-deploy.sh

# When prompted, edit .env:
nano /opt/vehiclevault/.env
# Change: USERNAME, PASSWORD, HOST_PORT=80
# Generate password: openssl rand -base64 32

# Option B: Manual
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose git
sudo systemctl enable docker && sudo systemctl start docker
sudo usermod -aG docker ubuntu
exit
# Log back in, then:
git clone YOUR_REPO_URL /opt/vehiclevault
cd /opt/vehiclevault
cp .env.example .env
nano .env  # Edit credentials
docker compose up --build -d
```

### 5️⃣ Verify & Access (2 min)
```bash
# Check status
docker compose ps

# All should show "healthy"
# Open browser:
http://YOUR_EC2_IP/
```

---

## 🎯 Critical Security Settings

### .env Configuration
```env
MONGO_INITDB_ROOT_USERNAME=vaultadmin
MONGO_INITDB_ROOT_PASSWORD=<openssl rand -base64 32>
MONGO_DB_NAME=vehiclevault
HOST_PORT=80
NODE_ENV=production
MAX_UPLOAD_SIZE_MB=10
```

### Security Group Rules (Only These!)
| Port | Source | Purpose |
|------|--------|---------|
| 22 | Your IP | SSH |
| 80 | 0.0.0.0/0 | HTTP |
| 443 | 0.0.0.0/0 | HTTPS |

**❌ NEVER open:** 27017 (MongoDB), 5000 (Backend)

---

## 📞 Quick Commands

### Check Status
```bash
cd /opt/vehiclevault
docker compose ps
docker compose logs -f
```

### Restart
```bash
docker compose restart
```

### Update
```bash
git pull
docker compose up --build -d
```

### Stop
```bash
docker compose down
```

### Backup
```bash
docker run --rm -v vehiclevault_vehicle_documents:/src -v /backup:/dest alpine tar czf /dest/uploads-$(date +%Y%m%d).tar.gz -C /src .
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't SSH | Check security group port 22, verify key permissions |
| Can't access website | Check security group port 80, verify `docker compose ps` |
| Services not healthy | Check logs: `docker compose logs -f` |
| Port 80 denied | Change HOST_PORT=8080 in .env |
| MongoDB errors | Verify .env credentials, restart backend |

---

## 💡 Important Notes

1. **First deployment takes 5-10 minutes** (Docker image builds)
2. **Instance costs ~$15/month** (t3.small) or free for 1 year (t2.micro)
3. **Data persists in Docker volumes** even if containers restart
4. **Never run `docker compose down -v`** (deletes all data!)
5. **Stop instance when not in use** to save money (data is safe)

---

## ✅ Success Indicators

- [ ] All 3 containers show "healthy"
- [ ] `curl http://localhost/api/health` returns JSON
- [ ] Browser shows VehicleVault at `http://YOUR_EC2_IP/`
- [ ] Can create vehicles and upload documents
- [ ] Dashboard shows statistics

---

## 🎉 You're Done!

**Your Application:** `http://YOUR_EC2_IP/`

**Next Steps:**
1. Configure domain name (optional)
2. Set up HTTPS with Certbot (recommended)
3. Enable automated backups
4. Add authentication (see README security section)

---

For detailed instructions, see: **AWS_EC2_DEPLOYMENT_GUIDE.md**
