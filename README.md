# 🚀 GitDeploy - Automatic GitHub Repository Sync & Deployment

**Automatically sync and deploy your GitHub repositories to any VPS with zero hassle.**

GitDeploy watches your GitHub repos, pulls updates automatically, and deploys them to your server. Perfect for small teams, side projects, and developers who want simple automation.

---

## ⚡ Quick Overview

```bash
npm install        # Install
npm start          # Setup wizard
# Answer a few questions, done!
```

**What it does:**
- 🔄 Automatically syncs your GitHub repos
- 🚀 Deploys to your VPS
- 🔒 Works with private repos
- ⏰ Scheduled updates (every 5 min, 1 hour, etc.)
- 📦 Supports Node.js, Python Flask, Static sites
- 🎛️ Background daemon keeps it running

**What you need:**
- Node.js 14+
- A VPS (DigitalOcean, Linode, AWS, etc.)
- 5 minutes

---

## 📋 Table of Contents

1. [Installation](#-step-1-installation)
2. [Setup Wizard](#-step-2-setup-wizard)
3. [Using on VPS](#-step-3-using-on-your-vps)
4. [Commands Reference](#-commands-reference)
5. [Deployment Types](#-deployment-types)
6. [Troubleshooting](#-troubleshooting)
7. [FAQ](#-faq)

---

## 📦 STEP 1: Installation

### On Your Local Machine (Testing)

```bash
# 1. Check if Node.js is installed
node --version
npm --version

# If not installed:
# Windows: Download from https://nodejs.org/
# Mac: brew install node
# Linux: See below
```

### On Your VPS (Production)

```bash
# 1. SSH into your VPS
ssh user@your-vps-ip

# 2. Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 8.x.x or higher
```

### Download GitDeploy

```bash
# Clone the repository
git clone https://github.com/yourusername/gitdeploy.git
cd gitdeploy

# Install dependencies (takes 1-2 minutes)
npm install

# Verify it works
node bin/cli.js help
```

You should see:
```
╔════════════════════════════════════╗
║       GitDeploy - Auto Sync Tool     ║
╚════════════════════════════════════╝

📚 GitDeploy Commands
...
```

✅ **Installation complete!** Continue to Step 2.

---

## 🎯 STEP 2: Setup Wizard

Run the interactive setup wizard:

```bash
npm start
```

You'll be asked a series of questions. Here's what to expect:

---

### Question 1: Do you have private GitHub repositories?

```
? Do you have private GitHub repositories? (Y/n)
```

**Answer:**
- Type `Y` and press Enter - If you have private repos
- Type `N` and press Enter - If you only use public repos

---

### Question 2: Get Your GitHub Token (Only if you answered Yes)

You'll see instructions:

```
📖 Getting your Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" (classic)
3. Select scopes: repo (all), read:user
4. Copy the token (you won't see it again)

? Paste your GitHub token: ********
```

**Follow these steps:**

1. **Open a new browser tab** and go to: https://github.com/settings/tokens

2. **Click the "Generate new token" button** (choose "classic")

3. **Give it a name:** Type "GitDeploy" in the Note field

4. **Select permissions** - Check these boxes:
   - ☑ **repo** (This will check all sub-items)
     - repo:status
     - repo_deployment
     - public_repo
     - repo:invite
     - security_events
   - ☑ **read:user**

5. **Scroll down and click "Generate token"**

6. **Copy the token** - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`
   ⚠️ You won't see it again, so copy it now!

7. **Go back to your terminal** and paste the token

8. **Press Enter**

You should see:
```
✓ Token saved for user: your-github-username
```

---

### Question 3: Enter GitHub repository URL

```
? Enter GitHub repository URL (or empty to skip):
```

**Enter your repository URL:**

Valid formats:
```
https://github.com/username/repo-name
https://github.com/username/repo-name.git
```

Examples:
- `https://github.com/facebook/react`
- `https://github.com/yourname/my-website`
- `https://github.com/yourname/my-app.git`

**Or press Enter** to skip and add repositories later.

---

### Question 4: How should we deploy this repository?

```
? How should we deploy "your-repo"?
❯ Node.js + Nginx - Node.js application served by Nginx reverse proxy
  Static + Apache - HTML/CSS/JS served by Apache HTTP Server
  Node.js + PM2 - Node.js application with PM2 process manager
  Python Flask + Nginx - Python Flask application with Nginx and Gunicorn
  Static + Nginx - HTML/CSS/JS served by Nginx
```

**Use arrow keys** to move up/down, then press Enter to select.

**Choose based on your project:**

| If your project is... | Choose this |
|-----------------------|-------------|
| HTML/CSS/JS website | Static + Nginx |
| React/Vue/Angular (production build) | Static + Nginx |
| Node.js/Express backend | Node.js + PM2 |
| Node.js web app | Node.js + Nginx |
| Python Flask app | Python Flask + Nginx |
| WordPress/PHP site | Static + Apache |

---

### Question 5: How often should we check for updates?

```
? How often should we check for updates?
❯ Every 5 minutes
  Every 15 minutes
  Every 30 minutes
  Every hour
  Manual only
```

**Recommendations:**
- **Development/Testing:** Every 5 minutes (get changes fast)
- **Production (active development):** Every 15-30 minutes
- **Production (stable):** Every hour
- **You control when:** Manual only

---

### Question 6: Enable automatic synchronization?

```
? Enable automatic synchronization? (Y/n)
```

**Answer:**
- `Y` - GitDeploy will automatically check GitHub and pull changes
- `N` - You'll manually run sync with `node bin/cli.js sync`

---

### ✅ Setup Complete!

```
✅ Setup complete! Your configuration is ready.

Next steps:
  • Run: gitdeploy list    - to see your repositories
  • Run: gitdeploy sync    - to manually sync repositories
  • Run: gitdeploy help    - for more commands
```

**Your configuration is saved in:**
- Linux/Mac: `~/.gitdeploy/config.json`
- Windows: `C:\Users\YourName\.gitdeploy\config.json`

---

## 🌐 STEP 3: Using on Your VPS

### A. Connect to Your VPS

```bash
ssh user@your-vps-ip

# Examples:
ssh root@192.168.1.100
ssh ubuntu@myserver.com
```

### B. Install GitDeploy (repeat Step 1 on VPS)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Clone GitDeploy
git clone https://github.com/yourusername/gitdeploy.git
cd gitdeploy

# Install dependencies
npm install
```

### C. Run Setup on VPS (repeat Step 2)

```bash
npm start
```

Answer the same questions as before. Add your repositories.

### D. Test Manual Sync

```bash
# This downloads your repository
node bin/cli.js sync
```

You should see:
```
🔄 Starting sync of 1 repository(ies)...

→ Cloning your-repo...
Repository cloned to ~/.gitdeploy/repositories/your-repo
✅ Sync completed!
```

Your repository is now in: `~/.gitdeploy/repositories/your-repo-name/`

### E. Deploy Your Application

```bash
# Get the deployment script
node bin/cli.js deploy your-repo-name
```

This will show you a deployment script. Example output:

```bash
🚀 Deploying your-repo

Deployment Type: Node.js + Nginx
Repository Path: /home/user/.gitdeploy/repositories/your-repo
Requirements: Node.js, npm, Nginx

? Continue with deployment? Yes

Setup script for your VPS:

──────────────────────────────────────────────────
#!/bin/bash
# Node.js + Nginx Setup Script
...
──────────────────────────────────────────────────

Run the above script on your VPS with:
bash script.sh your-repo /home/user/.gitdeploy/repositories/your-repo
```

**To deploy:**

1. **Copy the entire script** shown in the output

2. **Create a file on your VPS:**
   ```bash
   nano deploy.sh
   ```

3. **Paste the script**, then save:
   - Press `Ctrl+O`, then `Enter` to save
   - Press `Ctrl+X` to exit

4. **Make it executable:**
   ```bash
   chmod +x deploy.sh
   ```

5. **Run it:**
   ```bash
   sudo bash deploy.sh your-repo-name ~/.gitdeploy/repositories/your-repo-name
   ```

6. **Wait for it to complete** (2-5 minutes)

7. **Test your deployment:**
   ```bash
   curl http://localhost
   # Or visit http://your-vps-ip in browser
   ```

### F. Start Auto-Sync Daemon

```bash
# Start background sync service
node src/daemon.js start
```

You should see:
```
✅ GitDeploy daemon started

Auto-sync scheduler is now running in the background
Log file: ~/.gitdeploy/sync.log
```

Now GitDeploy will automatically check for updates and pull changes!

### G. Verify Everything is Running

```bash
# Check daemon status
node src/daemon.js status

# View recent sync logs
tail -f ~/.gitdeploy/sync.log

# List all repositories
node bin/cli.js list

# Check sync status
node bin/cli.js status
```

---

## 💻 Commands Reference

### Repository Management

```bash
# List all repositories
node bin/cli.js list

# Add a new repository
node bin/cli.js add

# Remove a repository
node bin/cli.js remove

# Show repository status
node bin/cli.js status
```

### Syncing

```bash
# Sync all repositories
node bin/cli.js sync

# Sync specific repository
node bin/cli.js sync repo-name
```

### Deployment

```bash
# Get deployment script for a repository
node bin/cli.js deploy repo-name
```

### Configuration

```bash
# Show current configuration
node bin/cli.js config

# Run setup wizard again
node bin/cli.js setup
# or
npm start

# View all commands
node bin/cli.js help
```

### Daemon (Background Service)

```bash
# Start auto-sync daemon
node src/daemon.js start

# Check daemon status
node src/daemon.js status

# Stop daemon
node src/daemon.js stop
```

### View Logs

```bash
# View sync logs
cat ~/.gitdeploy/sync.log

# Watch logs in real-time
tail -f ~/.gitdeploy/sync.log
```

---

## 🚀 Deployment Types

### 1. Node.js + Nginx

**Best for:** Node.js web apps, Express APIs, real-time apps

**What happens:**
- Installs Node.js 18 and Nginx
- Runs `npm install` in your repo
- Starts your app on port 3000
- Configures Nginx as reverse proxy on port 80
- Your app is available at `http://your-vps-ip`

**Your repo should have:**
- `package.json`
- Main file (e.g., `index.js`, `server.js`, `app.js`)

---

### 2. Node.js + PM2

**Best for:** Node.js apps, microservices, background workers

**What happens:**
- Installs Node.js 18 and PM2
- Runs `npm install`
- Starts your app with PM2 (auto-restart, clustering)
- Runs on configured port

**Your repo should have:**
- `package.json`
- Main file that starts the server

---

### 3. Static + Nginx

**Best for:** HTML/CSS/JS sites, React/Vue/Angular builds, documentation

**What happens:**
- Installs Nginx
- Copies files to `/var/www/site-name`
- Serves static files on port 80
- Your site is available at `http://your-vps-ip`

**Your repo should have:**
- `index.html` in the root or build folder
- Static assets (CSS, JS, images)

---

### 4. Static + Apache

**Best for:** Static sites, PHP sites (with PHP installed), WordPress

**What happens:**
- Installs Apache2
- Copies files to `/var/www/site-name`
- Configures virtual host
- Enables mod_rewrite for URL rewriting
- Your site is available at `http://your-vps-ip`

**Your repo should have:**
- `index.html` or `index.php`
- Static/PHP files

---

### 5. Python Flask + Nginx

**Best for:** Flask web apps, Python APIs

**What happens:**
- Installs Python 3, Flask, Gunicorn, Nginx
- Creates Python virtual environment
- Installs requirements from `requirements.txt`
- Starts Gunicorn with 4 workers
- Configures Nginx as reverse proxy
- Your app is available at `http://your-vps-ip`

**Your repo should have:**
- `app.py` with Flask app
- `requirements.txt` with dependencies

---

## 🔧 Troubleshooting

### Installation Issues

**Problem:** `npm: command not found`

**Solution:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

---

**Problem:** `EACCES: permission denied` during npm install

**Solution:**
```bash
# Option 1: Install with sudo
sudo npm install

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install
```

---

**Problem:** `Module not found` errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

### Setup Issues

**Problem:** Token validation failed

**Solution:**
1. Go to https://github.com/settings/tokens
2. Delete old token (if any)
3. Generate new token
4. Make sure to select `repo` and `read:user` scopes
5. Copy the token immediately
6. Run `npm start` and paste the new token

---

**Problem:** Cannot access repository

**Solutions:**
- **Check if repo is private:** Make sure you entered GitHub token
- **Verify token scopes:** Token must have `repo` access
- **Check URL format:** Use `https://github.com/user/repo` format (not SSH)
- **Verify repo exists:** Check the URL on GitHub

---

### Sync Issues

**Problem:** Sync fails or hangs

**Solution:**
```bash
# Check logs
cat ~/.gitdeploy/sync.log

# Try manual sync with specific repo
node bin/cli.js sync repo-name

# Check git status manually
cd ~/.gitdeploy/repositories/repo-name
git status
git pull
```

---

**Problem:** Permission denied (publickey)

**Solution:** Use HTTPS URLs, not SSH URLs
```
✅ https://github.com/user/repo.git
❌ git@github.com:user/repo.git
```

---

### Deployment Issues

**Problem:** Deployment script fails

**Solution:**
```bash
# Make sure you run with sudo
sudo bash deploy-script.sh repo-name /path/to/repo

# Check service status
systemctl status nginx
systemctl status your-app-name

# View error logs
sudo tail -f /var/log/nginx/error.log
```

---

**Problem:** Port already in use

**Solution:**
```bash
# Find what's using the port (example: 3000)
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or change your app's port
```

---

**Problem:** Nginx won't start

**Solution:**
```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Fix common issue: remove default site
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

---

### Daemon Issues

**Problem:** Daemon won't start

**Solution:**
```bash
# Check if already running
ps aux | grep gitdeploy

# Check logs
cat ~/.gitdeploy/sync.log

# Kill existing process and restart
pkill -f daemon.js
node src/daemon.js start
```

---

**Problem:** Daemon stops after closing terminal

**Solution:** Use `nohup` or set up systemd service

```bash
# Quick fix: Use nohup
nohup node src/daemon.js start > /dev/null 2>&1 &

# Better: Create systemd service
sudo nano /etc/systemd/system/gitdeploy.service
```

Add:
```ini
[Unit]
Description=GitDeploy Auto-Sync Daemon
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/gitdeploy
ExecStart=/usr/bin/node /path/to/gitdeploy/src/daemon.js start
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable gitdeploy
sudo systemctl start gitdeploy
sudo systemctl status gitdeploy
```

---

## ❓ FAQ

### General

**Q: Is GitDeploy free?**

A: Yes! GitDeploy is completely free and open-source.

---

**Q: Can I use it with private repositories?**

A: Yes! Just provide your GitHub Personal Access Token during setup.

---

**Q: What VPS providers work?**

A: Any VPS with Linux! DigitalOcean, Linode, AWS EC2, Vultr, Hetzner, Google Cloud, etc.

---

**Q: Does it work on Windows?**

A: Yes for local testing. For production deployments, use a Linux VPS (Ubuntu/Debian).

---

### Configuration

**Q: How often does it check for updates?**

A: You configure this during setup. Options: every 5 min, 15 min, 30 min, 1 hour, or manual only.

---

**Q: Can I deploy multiple repositories?**

A: Yes! Add as many repositories as you want using `node bin/cli.js add`.

---

**Q: How do I change settings later?**

A: Run `npm start` again to reconfigure, or manually edit `~/.gitdeploy/config.json`.

---

**Q: Can I change the deployment type?**

A: Yes. Remove the repo (`node bin/cli.js remove`) and add it again with a different deployment type.

---

### Security

**Q: Where are my GitHub tokens stored?**

A: Encrypted in `~/.gitdeploy/config.json`. Never committed to git.

---

**Q: Is it secure?**

A: Tokens are encrypted with AES-256. Config files are local only. Never transmitted anywhere except GitHub API.

---

**Q: What permissions does the GitHub token need?**

A: Only `repo` (for private repos) and `read:user`. Minimal access.

---

### Usage

**Q: How do I stop auto-sync?**

A: `node src/daemon.js stop`

---

**Q: Can I see sync history?**

A: Yes! `cat ~/.gitdeploy/sync.log` or `tail -f ~/.gitdeploy/sync.log` for real-time.

---

**Q: How do I update GitDeploy?**

A: `cd gitdeploy && git pull && npm install`

---

**Q: Can I use custom deployment scripts?**

A: Yes! The scripts are in `deployments/` folder. You can modify them or create your own.

---

### Compatibility

**Q: Does it support GitLab or Bitbucket?**

A: Currently GitHub only. GitLab/Bitbucket support planned for future versions.

---

**Q: What Node.js versions are supported?**

A: Node.js 14.0.0 or higher. Recommended: Node.js 18.x LTS.

---

**Q: Can I contribute?**

A: Yes! GitDeploy is open-source. Fork it, make improvements, submit a PR!

---

## 🎉 You're All Set!

**Quick recap:**

1. ✅ Installed GitDeploy: `npm install`
2. ✅ Ran setup wizard: `npm start`
3. ✅ Deployed to VPS
4. ✅ Started auto-sync: `node src/daemon.js start`

**Your repositories will now automatically sync and deploy!**

### What Happens Next?

1. You push code to GitHub
2. GitDeploy detects the update (every X minutes)
3. Automatically pulls the latest code
4. Your VPS has the latest version
5. Your app/site is updated

**All without you doing anything!** 🎊

---

## 📚 Additional Information

### Project Structure

```
gitdeploy/
├── bin/
│   └── cli.js              # Main CLI entry
├── src/
│   ├── config-manager.js   # Configuration
│   ├── github-auth.js      # GitHub API
│   ├── sync-engine.js      # Git operations
│   ├── deployment-manager.js # Deployments
│   ├── setup-wizard.js     # Setup wizard
│   ├── command-handler.js  # CLI commands
│   ├── sync-scheduler.js   # Auto-sync
│   └── daemon.js           # Background service
├── deployments/            # Deployment scripts
│   ├── nodejs-nginx-setup.sh
│   ├── nodejs-pm2-setup.sh
│   ├── python-flask-setup.sh
│   ├── static-apache-setup.sh
│   └── static-nginx-setup.sh
└── package.json            # Dependencies
```

### Configuration File Location

**Linux/Mac:** `~/.gitdeploy/config.json`
**Windows:** `C:\Users\YourName\.gitdeploy\config.json`

### Repository Storage

**Linux/Mac:** `~/.gitdeploy/repositories/`
**Windows:** `C:\Users\YourName\.gitdeploy\repositories\`

---

## 📄 License

MIT License

---

## 🌟 Support

If you find GitDeploy useful:
- ⭐ Star the repo on GitHub
- 🐛 Report issues
- 💡 Suggest features
- 🤝 Contribute code

---

**Happy deploying! 🚀**

Made with ❤️ for developers who want simple, automated deployments.


