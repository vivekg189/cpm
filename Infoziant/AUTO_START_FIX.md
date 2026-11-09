# 🔄 Fix Auto-Start Issue - Make Application Always Available

## ❌ Problem
Application works when you run `docker compose up -d`, but stops working when you:
- Close SSH session
- Reboot EC2
- Docker service restarts

## ✅ Solution
Configure Docker and containers to auto-start on EC2 boot.

---

## 🚀 RUN THESE COMMANDS ON EC2

### Step 1: SSH to EC2
```bash
ssh -i C:\Users\rushi\Downloads\vehicalevault-key.pem ubuntu@54.166.204.201
```

### Step 2: Enable Docker to Start on Boot
```bash
# Enable Docker service
sudo systemctl enable docker

# Start Docker service
sudo systemctl start docker

# Verify Docker is enabled
sudo systemctl is-enabled docker
# Should show: enabled
```

### Step 3: Navigate to Project Directory
```bash
cd /opt/vehiclevault
```

### Step 4: Stop and Remove All Containers
```bash
docker compose down
```

### Step 5: Start Containers with Restart Policy
```bash
docker compose up -d
```

### Step 6: Verify Containers are Running
```bash
docker compose ps
```

**Should show:**
```
NAME                   STATUS
vehiclevault-backend   Up (healthy)
vehiclevault-frontend  Up (healthy)
vehiclevault-mongodb   Up (healthy)
```

### Step 7: Check Restart Policy
```bash
docker inspect vehiclevault-frontend | grep -A 3 RestartPolicy
```

**Should show:**
```json
"RestartPolicy": {
    "Name": "unless-stopped",
    "MaximumRetryCount": 0
},
```

### Step 8: Test Auto-Start

**Test 1: Docker Restart**
```bash
# Restart Docker service
sudo systemctl restart docker

# Wait 30 seconds
sleep 30

# Check if containers auto-started
docker compose ps
```

**All should be "Up (healthy)" ✅**

**Test 2: Full Reboot** (Optional - will disconnect SSH)
```bash
# Reboot EC2
sudo reboot
```

Wait 2-3 minutes, then:
- Open browser: http://54.166.204.201
- Should load automatically! ✅

---

## 🔧 CREATE SYSTEMD SERVICE (Alternative - More Reliable)

If the above doesn't work, create a systemd service:

### Step 1: Create Service File
```bash
sudo nano /etc/systemd/system/vehiclevault.service
```

### Step 2: Paste This Content
```ini
[Unit]
Description=VehicleVault Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/vehiclevault
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

**Save:** Ctrl+X, Y, Enter

### Step 3: Enable and Start Service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable vehiclevault.service

# Start service now
sudo systemctl start vehiclevault.service

# Check status
sudo systemctl status vehiclevault.service
```

**Should show:** `active (exited)` - this is normal for oneshot services

### Step 4: Verify Containers Running
```bash
docker compose ps
```

### Step 5: Test Reboot
```bash
# Reboot
sudo reboot

# Wait 2-3 minutes, then check browser
# http://54.166.204.201 should load automatically!
```

---

## 📋 VERIFICATION CHECKLIST

Run these commands to verify everything:

```bash
# 1. Check Docker is enabled
sudo systemctl is-enabled docker
# Expected: enabled

# 2. Check Docker is running
sudo systemctl status docker
# Expected: active (running)

# 3. Check containers are running
docker compose ps
# Expected: All "Up (healthy)"

# 4. Check restart policies
docker inspect vehiclevault-frontend vehiclevault-backend vehiclevault-mongodb | grep -A 3 RestartPolicy
# Expected: "Name": "unless-stopped" for all

# 5. Test application
curl http://localhost/api/health
# Expected: {"status":"ok",...}

# 6. Check from browser
# Open: http://54.166.204.201
# Expected: Application loads ✅
```

---

## 🎯 COMPLETE AUTO-START SCRIPT

Copy and run this entire script on EC2:

```bash
#!/bin/bash
echo "🔧 Configuring VehicleVault Auto-Start"

# Enable Docker on boot
echo "1️⃣ Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Navigate to project
echo "2️⃣ Navigating to project..."
cd /opt/vehiclevault || exit 1

# Stop containers
echo "3️⃣ Stopping containers..."
docker compose down

# Start containers with restart policy
echo "4️⃣ Starting containers..."
docker compose up -d

# Wait for startup
echo "5️⃣ Waiting for services to be healthy..."
sleep 30

# Check status
echo "6️⃣ Container status:"
docker compose ps

# Test locally
echo "7️⃣ Testing API:"
curl -s http://localhost/api/health | jq 2>/dev/null || curl http://localhost/api/health

echo ""
echo "✅ Done! Your application should now:"
echo "   - Auto-start when EC2 boots"
echo "   - Auto-restart if containers crash"
echo "   - Stay running when you close SSH"
echo ""
echo "🌐 Test now: http://54.166.204.201"
echo ""
echo "🔄 To test auto-start, run: sudo reboot"
echo "   (Wait 2-3 minutes after reboot, then check browser)"
```

**Save and run:**
```bash
cd /opt/vehiclevault
nano autostart.sh
# Paste the script above
# Save: Ctrl+X, Y, Enter

chmod +x autostart.sh
./autostart.sh
```

---

## 🧪 FINAL TEST

### Test 1: Close SSH and Check Browser
```bash
# Just type:
exit

# Now open browser (without SSH):
# http://54.166.204.201
# Should still work! ✅
```

### Test 2: Reboot EC2 and Check Browser
```bash
# SSH in
ssh -i C:\Users\rushi\Downloads\vehicalevault-key.pem ubuntu@54.166.204.201

# Reboot
sudo reboot

# Wait 2-3 minutes

# Open browser (don't SSH in):
# http://54.166.204.201
# Should work automatically! ✅
```

---

## ❓ TROUBLESHOOTING

### Issue: Containers Don't Start After Reboot

**Solution:**
```bash
# Check Docker service status
sudo systemctl status docker

# Check Docker logs
sudo journalctl -u docker --since "5 minutes ago"

# Manually start containers
cd /opt/vehiclevault
docker compose up -d
```

### Issue: Docker Service Not Enabled

**Solution:**
```bash
# Enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Verify
sudo systemctl is-enabled docker
```

### Issue: Port 80 Blocked After Reboot

**Solution:**
```bash
# Check what's using port 80
sudo lsof -i :80

# If Apache/Nginx is running:
sudo systemctl stop apache2 nginx
sudo systemctl disable apache2 nginx

# Restart containers
docker compose restart frontend
```

---

## ✅ SUCCESS INDICATORS

Your application is properly configured when:

- ✅ `sudo systemctl is-enabled docker` shows "enabled"
- ✅ `docker compose ps` shows all containers "Up (healthy)"
- ✅ `curl http://localhost/api/health` returns JSON
- ✅ Browser shows application at http://54.166.204.201
- ✅ Application still works after closing SSH
- ✅ Application auto-starts after EC2 reboot

---

**Run the auto-start script above and test it!** 🚀
