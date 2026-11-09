# 🚀 CI/CD Pipeline Setup Guide

## ✅ What This Does

Your project now has a **GitHub Actions CI/CD pipeline** that automatically:
- ✅ Tests your code when you push
- ✅ Builds your application
- ✅ Deploys to your EC2 instance
- ✅ Verifies the deployment was successful

**Result:** Just `git push` and your live application updates automatically! 🎉

---

## 🔧 Setup Instructions (One-Time - 5 Minutes)

### Step 1: Add GitHub Secrets

GitHub Actions needs access to your EC2. We'll store credentials securely.

1. **Go to your GitHub repository:**
   ```
   https://github.com/venkatrupesh/Infoziant
   ```

2. **Navigate to Settings:**
   - Click **"Settings"** tab (top right)
   - Click **"Secrets and variables"** → **"Actions"** (left sidebar)
   - Click **"New repository secret"** (green button)

3. **Add three secrets:**

#### Secret 1: EC2_HOST
- **Name:** `EC2_HOST`
- **Value:** `54.166.204.201` (your EC2 public IP)
- Click **"Add secret"**

#### Secret 2: EC2_USER
- **Name:** `EC2_USER`
- **Value:** `ubuntu`
- Click **"Add secret"**

#### Secret 3: EC2_SSH_KEY
- **Name:** `EC2_SSH_KEY`
- **Value:** Your private key content

**How to get your private key content:**

**On Windows (PowerShell):**
```powershell
Get-Content C:\Users\rushi\Downloads\vehicalevault-key.pem | clip
```
This copies the entire key to clipboard. Paste it into the GitHub secret value box.

**OR manually:**
- Open `C:\Users\rushi\Downloads\vehicalevault-key.pem` in Notepad
- Copy EVERYTHING (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
- Paste into GitHub secret

**Important:** The key should look like:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(many lines)
...
-----END RSA PRIVATE KEY-----
```

---

### Step 2: Update EC2 Remote URL

Your EC2 is still pointing to the old GitHub repo. Update it:

**SSH to EC2:**
```powershell
ssh -i C:\Users\rushi\Downloads\vehicalevault-key.pem ubuntu@54.166.204.201
```

**Run these commands:**
```bash
cd /opt/vehiclevault
git remote set-url origin https://github.com/venkatrupesh/Infoziant.git
git remote -v  # Verify it changed
exit
```

---

### Step 3: Push the CI/CD Files to GitHub

**On your Windows machine:**

```powershell
cd c:\Users\rushi\OneDrive\Desktop\Infoziant\Infoziant

# Stage the new workflow file
git add .github/workflows/deploy.yml
git add CI_CD_SETUP_GUIDE.md

# Commit
git commit -m "Add CI/CD pipeline with GitHub Actions"

# Push
git push origin master
```

---

### Step 4: Watch the Magic! ✨

1. **Go to GitHub Actions:**
   ```
   https://github.com/venkatrupesh/Infoziant/actions
   ```

2. **You'll see your workflow running:**
   - Click on the workflow run to see live logs
   - Watch as it builds and deploys automatically
   - Takes about 3-5 minutes

3. **Check your EC2:**
   - After workflow completes, visit: `http://54.166.204.201`
   - Your application should be updated!

---

## 🎯 How to Use CI/CD Daily

### Simple Workflow:

1. **Make changes to your code** (any file)
2. **Commit and push:**
   ```powershell
   git add .
   git commit -m "Your change description"
   git push origin master
   ```
3. **Wait 3-5 minutes** - GitHub Actions deploys automatically!
4. **Visit your site:** `http://54.166.204.201`

**That's it!** No SSH, no manual commands, no waiting.

---

## 📊 What Happens Behind the Scenes

```
┌─────────────────────────────────────────────────────────┐
│ You: git push                                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ GitHub Actions Starts (Automatic)                        │
├─────────────────────────────────────────────────────────┤
│ 1. ✓ Checkout code                                      │
│ 2. ✓ Install dependencies                               │
│ 3. ✓ Run tests                                          │
│ 4. ✓ Build frontend                                     │
│ 5. ✓ SSH to EC2                                         │
│ 6. ✓ Pull latest code                                   │
│ 7. ✓ Rebuild Docker containers                          │
│ 8. ✓ Verify deployment                                  │
│ 9. ✓ Send notification                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ✅ Your application is LIVE with new changes!           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Monitoring Your Deployments

### View Deployment Logs:
1. Go to: `https://github.com/venkatrupesh/Infoziant/actions`
2. Click on any workflow run
3. Click **"Deploy to AWS EC2"**
4. See detailed logs of what happened

### Manual Deployment:
If you want to deploy without pushing code:
1. Go to: `https://github.com/venkatrupesh/Infoziant/actions`
2. Click **"Deploy to EC2"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch it deploy!

---

## 🛠️ Troubleshooting

### Deployment Fails with "Permission Denied"
- Check that `EC2_SSH_KEY` secret is correct
- Verify the key includes `-----BEGIN` and `-----END` lines
- Make sure no extra spaces or characters

### Can't Connect to EC2
- Verify `EC2_HOST` secret is `54.166.204.201`
- Check EC2 security group allows SSH (port 22) from GitHub IPs

### Build Fails
- Check the logs in GitHub Actions
- SSH to EC2 manually and check: `docker compose logs`

### Application Not Updating
- Clear browser cache (Ctrl+F5)
- Check GitHub Actions shows "✅ Success"
- SSH to EC2 and run: `cd /opt/vehiclevault && docker compose ps`

---

## 🎉 Benefits You Now Have

✅ **No More Manual SSH** - Just `git push`  
✅ **Automatic Testing** - Catches bugs before deployment  
✅ **Deployment History** - See all past deployments in GitHub  
✅ **Rollback Easy** - Just revert the commit and push  
✅ **Professional Workflow** - Industry standard CI/CD  
✅ **Save Time** - 15 minutes manual → 30 seconds automatic  

---

## 📝 Example: Making a Change

Let's say you want to change the app title:

**1. Edit file:**
```powershell
# Open frontend/src/App.jsx in VS Code
# Change the title
```

**2. Push to GitHub:**
```powershell
git add frontend/src/App.jsx
git commit -m "Update app title"
git push origin master
```

**3. Watch deployment:**
- Go to: `https://github.com/venkatrupesh/Infoziant/actions`
- See your deployment running
- Wait 3-5 minutes

**4. Refresh your browser:**
- Visit: `http://54.166.204.201`
- See your new title! 🎉

---

## 🔐 Security Notes

✅ **Your SSH key is encrypted** in GitHub Secrets  
✅ **Only your workflows can access it**  
✅ **Not visible in logs or UI**  
✅ **Can be rotated anytime**  

To rotate:
1. Delete old secret in GitHub
2. Add new secret with new key
3. Done!

---

## 📞 Need Help?

If deployment fails:
1. Check GitHub Actions logs
2. SSH to EC2 and check: `docker compose logs`
3. Verify all three secrets are set correctly
4. Try manual deployment to test

---

## ✅ Checklist

- [ ] Added `EC2_HOST` secret to GitHub
- [ ] Added `EC2_USER` secret to GitHub
- [ ] Added `EC2_SSH_KEY` secret to GitHub
- [ ] Updated EC2 git remote URL
- [ ] Pushed workflow file to GitHub
- [ ] Watched first deployment succeed
- [ ] Tested application works
- [ ] Made a test change and deployed

---

**🎉 Congratulations! You now have a professional CI/CD pipeline!**

Every `git push` automatically deploys to your live EC2 instance! 🚀
