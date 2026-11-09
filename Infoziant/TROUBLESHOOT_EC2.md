# 🔧 EC2 Troubleshooting Guide - Site Can't Be Reached

## ❌ Problem: "This site can't be reached" when accessing http://54.166.204.201

---

## 🚀 SOLUTION: Run These Commands on EC2

### Step 1: SSH to Your EC2

```powershell
ssh -i C:\Users\rushi\Downloads\vehicalevault-key.pem ubuntu@54.166.204.201
```

---

### Step 2: Check Docker Status

```bash
# Check if Docker is running
sudo systemctl status docker

# If not running, start it:
sudo systemctl start docker
sudo systemctl enable docker
```

---

### Step 3: Navigate to Project Directory

```bash
cd /opt/vehiclevault
```

---

### Step 4: Check Container Status

```bash
docker compose ps -a
```

**Expected Output (GOOD):**
```
NAME                   STATUS
vehiclevault-backend   Up X minutes (healthy)
vehiclevault-frontend  Up X minutes (healthy)
vehiclevault-mongodb   Up X minutes (healthy)
```

**If you see "Exited" or "Unhealthy":** Continue to next steps

---

### Step 5: Check If Directory Exists

```bash
pwd
# Should show: /opt/vehiclevault

ls -la
# Should show: compose.yaml, backend/, frontend/, .env
```

**If directory doesn't exist or files are missing:**
```bash
# Directory is missing - need to redeploy
# Follow deployment guide to clone repository again
```

---

### Step 6: Stop All Containers (Clean Start)

```bash
cd /opt/vehiclevault
docker compose down
docker system prune -f
```

---

### Step 7: Check .env File

```bash
cat .env
```

**Verify these values exist:**
```
MONGO_INITDB_ROOT_USERNAME=vaultuser
MONGO_INITDB_ROOT_PASSWORD=<some password>
MONGO_DB_NAME=vehiclevault
NODE_ENV=production
PORT=5000
HOST_PORT=80
```

**If .env is missing or wrong:**
```bash
nano .env
# Copy content from .env.example
# Update passwords
# Save: Ctrl+X, Y, Enter
```

---

### Step 8: Start Containers with Logs

```bash
cd /opt/vehiclevault
docker compose up -d
```

Wait 30 seconds, then check:
```bash
docker compose ps
```

---

### Step 9: Check Logs for Errors

```bash
# Check all logs
docker compose logs --tail=50

# Check specific services
docker compose logs backend --tail=30
docker compose logs frontend --tail=30
docker compose logs mongodb --tail=30
```

**Look for errors like:**
- ❌ "MongoDB connection failed"
- ❌ "Port already in use"
- ❌ "Permission denied"
- ❌ "Module not found"

---

### Step 10: Test from EC2 Itself

```bash
# Test if frontend responds locally
curl http://localhost/api/health

# Should return JSON:
{"status":"ok","timestamp":"...","uptime":...}
```

**If this works:** Port 80 issue with security group  
**If this fails:** Container/application issue

---

### Step 11: Check Port Bindings

```bash
# See what's listening on port 80
sudo lsof -i :80

# Should show Docker/Nginx
```

**If nothing is listening on port 80:**
```bash
# Frontend container isn't running or not exposed
docker compose logs frontend
```

---

## 🔍 COMMON ISSUES & SOLUTIONS

### Issue 1: MongoDB Connection Errors

**Symptom:**
```
Backend logs show: "MongoDB connection failed"
```

**Solution:**
```bash
# Check MongoDB password has no special characters
nano .env
# Change MONGO_INITDB_ROOT_PASSWORD to simple alphanumeric
# Example: MONGO_INITDB_ROOT_PASSWORD=VaultPass123

# Restart
docker compose down
docker compose up -d
```

---

### Issue 2: Port 80 Already in Use

**Symptom:**
```
Error: bind: address already in use
```

**Solution:**
```bash
# Find what's using port 80
sudo lsof -i :80

# If Apache or Nginx is running:
sudo systemctl stop apache2
sudo systemctl stop nginx
sudo systemctl disable apache2
sudo systemctl disable nginx

# Restart containers
docker compose up -d
```

---

### Issue 3: Containers Start Then Exit

**Symptom:**
```
docker compose ps shows "Exited (1)"
```

**Solution:**
```bash
# Check exit codes
docker compose ps -a

# View detailed logs
docker compose logs

# Common fix - rebuild images
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

### Issue 4: Directory /opt/vehiclevault Doesn't Exist

**Symptom:**
```
bash: cd: /opt/vehiclevault: No such file or directory
```

**Solution:**
```bash
# Create directory
sudo mkdir -p /opt/vehiclevault
sudo chown ubuntu:ubuntu /opt/vehiclevault

# Clone your repository
git clone https://github.com/venkatrupesh/complete-production.git /tmp/repo
cp -r /tmp/repo/Infoziant/* /opt/vehiclevault/

# Or if repository root has files:
git clone https://github.com/venkatrupesh/complete-production.git /opt/vehiclevault

cd /opt/vehiclevault

# Create .env file
nano .env
# Paste content, save

# Start
docker compose up -d
```

---

### Issue 5: Git Repository Exists But No Docker Files

**Symptom:**
```
ls shows only README or Infoziant folder
```

**Solution:**
```bash
cd /opt/vehiclevault

# If files are in subdirectory
ls
# See: Infoziant/

# Move files up
mv Infoziant/* .
mv Infoziant/.* . 2>/dev/null
rmdir Infoziant

# Now start
docker compose up -d
```

---

## ✅ QUICK FIX SCRIPT

Copy and paste this entire block:

```bash
#!/bin/bash
echo "🔧 Quick Fix Script"

cd /opt/vehiclevault || exit 1

echo "📥 Stopping containers..."
docker compose down 2>/dev/null

echo "🧹 Cleaning up..."
docker system prune -f

echo "🔄 Starting containers..."
docker compose up -d

echo "⏳ Waiting 30 seconds..."
sleep 30

echo "✅ Container Status:"
docker compose ps

echo "📋 Backend Logs:"
docker compose logs backend --tail=20

echo "📋 Frontend Logs:"
docker compose logs frontend --tail=20

echo "🧪 Testing API:"
curl http://localhost/api/health

echo ""
echo "✅ Done! Try accessing http://54.166.204.201 now"
```

**Run it:**
```bash
cd /opt/vehiclevault
bash <(curl -s https://raw.githubusercontent.com/venkatrupesh/complete-production/master/quick-fix.sh)
```

---

## 🎯 STEP-BY-STEP FULL RESET

If nothing works, complete reset:

```bash
# 1. Stop everything
cd /opt/vehiclevault
docker compose down -v
docker system prune -af

# 2. Remove project
cd ~
sudo rm -rf /opt/vehiclevault

# 3. Recreate
sudo mkdir -p /opt/vehiclevault
sudo chown ubuntu:ubuntu /opt/vehiclevault

# 4. Clone repository
git clone https://github.com/venkatrupesh/complete-production.git /tmp/repo

# 5. Copy files (adjust based on your repo structure)
cp -r /tmp/repo/Infoziant/* /opt/vehiclevault/
# OR if files are at root:
# cp -r /tmp/repo/* /opt/vehiclevault/

# 6. Setup environment
cd /opt/vehiclevault
cp .env.example .env
nano .env
# Fill in values, save (Ctrl+X, Y, Enter)

# 7. Start
docker compose up --build -d

# 8. Wait and check
sleep 30
docker compose ps
docker compose logs --tail=50
```

---

## 📞 SEND ME THESE OUTPUTS

If still not working, run these and share the output:

```bash
# System info
echo "=== SYSTEM INFO ==="
uname -a
docker --version
docker compose version

# Directory structure
echo "=== DIRECTORY ==="
cd /opt/vehiclevault
pwd
ls -la

# Container status
echo "=== CONTAINERS ==="
docker compose ps -a

# Logs
echo "=== LOGS ==="
docker compose logs --tail=100

# Port check
echo "=== PORTS ==="
sudo lsof -i :80
sudo lsof -i :5000

# Environment
echo "=== ENV FILE ==="
cat .env | grep -v PASSWORD
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Docker is running: `sudo systemctl status docker`
- [ ] Directory exists: `cd /opt/vehiclevault` works
- [ ] Files exist: `ls` shows compose.yaml, .env
- [ ] .env has correct values
- [ ] Containers running: `docker compose ps` shows "Up (healthy)"
- [ ] Local curl works: `curl http://localhost/api/health`
- [ ] Browser works: http://54.166.204.201

---

**Follow these steps and let me know which step fails!** 🚀
