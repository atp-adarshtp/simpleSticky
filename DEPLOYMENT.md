# Deploy Sticky Notes App to Ubuntu 24 Server Using Git

## Overview
Deploy a full-stack React + Node.js + MongoDB application on Ubuntu 24 using Git for version control and deployment, with Nginx reverse proxy, PM2 process management, and SSL support.

## Prerequisites
- Ubuntu 24.04 server with SSH access
- Git repository (GitHub/GitLab/Bitbucket) with your code
- Domain name pointing to your server IP (optional, for SSL)
- Firewall configured (UFW)

---

## Step 1: Prepare Your Git Repository (On Windows)

### 1.1 Initialize Git (if not already done)
```powershell
cd "c:\Users\atp\Downloads\New folder\simpleSticky"
git init
```

### 1.2 Ensure .gitignore Protects Sensitive Files
Create or update `.gitignore` in the root directory:
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
server/.env
client/.env
.env.local
.env.production

# Build outputs
client/dist/
client/build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 1.3 Update Client Config for Production
Update `client/src/config.js` to use relative paths (so Nginx can proxy API requests):

```javascript
const config = {
  REACT_APP_LOCAL_SIGNUP_URL: '/api/auth/signup',
  REACT_APP_LOCAL_COLLECTIONS_URL: '/api/collections',
  REACT_APP_LOCAL_LOGIN_URL: '/api/auth/signin',
  REACT_APP_LOCAL_NOTE_EDIT_URL: '/api/collections',
  REACT_APP_LOCAL_COLLECTIONS_SHARED_URL: "/api/collections/shared",
  REACT_APP_LOCAL_COLLECTION_SHARE_URL: "/api/collections",
};

export default config;
```

### 1.4 Commit and Push to Your Git Repository
```powershell
git add .
git commit -m "Prepare for production deployment"

# Add your remote repository (replace with your actual Git URL)
git remote add origin YOUR_GIT_REPO_URL
git branch -M main
git push -u origin main
```

---

## Step 2: Server Preparation (On Ubuntu)

### 2.1 Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Required Software
```bash
# Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Verify installations
node --version  # Should show v20.x
npm --version
git --version
nginx -v
```

### 2.3 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 --version
```

---

## Step 3: Clone Repository on Server

### 3.1 Create Application Directory
```bash
sudo mkdir -p /var/www/simpleSticky
sudo chown -R $USER:$USER /var/www/simpleSticky
cd /var/www/simpleSticky
```

### 3.2 Clone Your Git Repository
```bash
git clone YOUR_GIT_REPO_URL .
```

### 3.3 Verify Files Are Present
```bash
ls -la
# Should see: client/  server/  .gitignore  README.md  etc.
```

---

## Step 4: Deploy Backend (Server)

### 4.1 Configure Environment Variables
Create production `.env` file in the server directory:
```bash
nano /var/www/simpleSticky/server/.env
```

Content:
```
PORT=5000
MONGO_URI=mongodb://admin:admin%40123@46.4.17.117:27017,88.198.18.234:27017,88.198.18.237:27017/?replicaSet=rs0&authSource=admin
API_KEY=your-secret-api-key-change-this
JWT_SECRET=your-jwt-secret-change-this
NODE_ENV=production
```

**Important**: 
- Change `API_KEY` and `JWT_SECRET` to strong random values
- Generate random secrets: `openssl rand -base64 32`

### 4.2 Set Secure Permissions for .env
```bash
chmod 600 /var/www/simpleSticky/server/.env
```

### 4.3 Install Dependencies
```bash
cd /var/www/simpleSticky/server
npm install --production
```

### 4.4 Start Backend with PM2
```bash
pm2 start server.js --name sticky-api
pm2 save
pm2 startup
# Copy and run the systemctl command that PM2 outputs
```

### 4.5 Verify Backend is Running
```bash
pm2 status
# Should show sticky-api as "online"
pm2 logs sticky-api --lines 20
```

---

## Step 5: Build and Deploy Frontend (Client)

### 5.1 Install Dependencies and Build
```bash
cd /var/www/simpleSticky/client
npm install
npm run build
```

This creates optimized static files in `client/dist/`.

### 5.2 Verify Build Output
```bash
ls -la /var/www/simpleSticky/client/dist/
# Should see: index.html, assets/, etc.
```

---

## Step 6: Configure Nginx

### 6.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/simpleSticky
```

Content:
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # Replace with your server IP or domain

    # Serve frontend static files
    root /var/www/simpleSticky/client/dist;
    index index.html;

    # Frontend routes (SPA fallback)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Replace `YOUR_SERVER_IP` with your actual server IP address or domain name.**

### 6.2 Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/simpleSticky /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### 6.3 Configure Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Step 7: SSL Setup (Optional but Highly Recommended)

### 7.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate
```bash
# If you have a domain name:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email for notifications
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: 2 - Redirect)
```

### 7.3 Verify Auto-Renewal
```bash
sudo certbot renew --dry-run
```

---

## Step 8: Verification and Testing

### 8.1 Check All Services
```bash
# Check PM2 processes
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check if ports are listening
sudo lsof -i :80
sudo lsof -i :5000
```

### 8.2 Test API Endpoint
```bash
curl http://localhost:5000/api/auth/signup
# Should return JSON response (not HTML)
```

### 8.3 Test Full Application
Open browser and navigate to:
- `http://YOUR_SERVER_IP` (or your domain)
- Test signup, login, and sticky notes functionality

### 8.4 Check Logs
```bash
# Backend logs
pm2 logs sticky-api --lines 50

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Step 9: Update Deployment (Future Changes)

When you make changes to your code:

### 9.1 On Your Windows Machine
```powershell
git add .
git commit -m "Description of changes"
git push origin main
```

### 9.2 On Ubuntu Server
```bash
cd /var/www/simpleSticky

# Pull latest changes
git pull origin main

# Update backend
cd server
npm install --production
pm2 restart sticky-api

# Rebuild frontend
cd ../client
npm install
npm run build

# Reload Nginx (usually not needed)
sudo systemctl reload nginx
```

### 9.3 Automated Update Script (Optional)
Create a deployment script for easier updates:
```bash
nano /var/www/simpleSticky/deploy.sh
```

Content:
```bash
#!/bin/bash
echo "🚀 Starting deployment..."

cd /var/www/simpleSticky

echo "📥 Pulling latest changes..."
git pull origin main

echo "🔧 Updating backend..."
cd server
npm install --production
pm2 restart sticky-api

echo "📦 Rebuilding frontend..."
cd ../client
npm install
npm run build

echo "✅ Deployment complete!"
pm2 status
```

Make it executable:
```bash
chmod +x /var/www/simpleSticky/deploy.sh
```

Run it:
```bash
./deploy.sh
```

---

## Architecture After Deployment

```
User Browser
    ↓ (port 80/443)
Nginx (Reverse Proxy)
    ├── / → Serve static files from /var/www/simpleSticky/client/dist
    └── /api/* → Proxy to http://localhost:5000
                    ↓
              Node.js/Express API (PM2 managed)
                    ↓
              MongoDB (remote cluster)
```

---

## Important Notes

### Security
1. **Change default secrets**: Update `JWT_SECRET` and `API_KEY` in server/.env
2. **Keep .env secure**: File permissions set to 600 (owner read/write only)
3. **Never commit .env**: Ensure it's in .gitignore
4. **Enable firewall**: UFW configured to allow only Nginx traffic
5. **Use SSL**: Let's Encrypt with auto-renewal

### MongoDB
- Your app connects to a remote MongoDB cluster
- Ensure your Ubuntu server IP is whitelisted in MongoDB access controls
- Test connection: `pm2 logs sticky-api` should show "MongoDB connected"

### PM2 Management
```bash
# View all processes
pm2 list

# View logs
pm2 logs sticky-api

# Restart API
pm2 restart sticky-api

# Stop API
pm2 stop sticky-api

# Monitor in real-time
pm2 monit
```

### Backup Strategy
```bash
# Backup environment variables
sudo cp /var/www/simpleSticky/server/.env /backup/server.env.bak

# Backup database (if local)
mongodump --out /backup/mongodb/
```

### Troubleshooting

**Frontend not loading:**
```bash
sudo nginx -t
sudo systemctl status nginx
ls -la /var/www/simpleSticky/client/dist/
```

**API not responding:**
```bash
pm2 status
pm2 logs sticky-api
curl http://localhost:5000/api/auth/signup
```

**MongoDB connection issues:**
```bash
pm2 logs sticky-api | grep -i mongo
# Check if server IP is whitelisted in MongoDB
```

**Permission issues:**
```bash
sudo chown -R $USER:$USER /var/www/simpleSticky
sudo chmod -R 755 /var/www/simpleSticky/client/dist
```
