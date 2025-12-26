# Flight380 - Deployment Guide for Hostinger VPS with Plesk

## 📋 Table of Contents
1. [Prerequisites & Requirements](#prerequisites--requirements)
2. [Step 1: Download Code from Emergent](#step-1-download-code-from-emergent)
3. [Step 2: Prepare Your VPS](#step-2-prepare-your-vps)
4. [Step 3: Install Required Software](#step-3-install-required-software)
5. [Step 4: Set Up MongoDB](#step-4-set-up-mongodb)
6. [Step 5: Deploy Backend (FastAPI)](#step-5-deploy-backend-fastapi)
7. [Step 6: Deploy Frontend (React)](#step-6-deploy-frontend-react)
8. [Step 7: Configure Nginx Reverse Proxy](#step-7-configure-nginx-reverse-proxy)
9. [Step 8: SSL Certificate Setup](#step-8-ssl-certificate-setup)
10. [Step 9: Process Management with PM2](#step-9-process-management-with-pm2)
11. [Environment Variables Reference](#environment-variables-reference)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites & Requirements

### Server Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 2 GB | 4 GB |
| CPU | 1 Core | 2 Cores |
| Storage | 20 GB | 40 GB |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

### Software Requirements
- **Node.js**: v18.x or higher
- **Python**: 3.9 or higher
- **MongoDB**: 6.0 or higher (or MongoDB Atlas)
- **Nginx**: Latest (usually pre-installed with Plesk)
- **PM2**: For Node.js process management
- **Supervisor**: For Python process management

### Domain Requirements
- A registered domain pointing to your VPS IP
- DNS A record configured

---

## Step 1: Download Code from Emergent

1. In the Emergent chat interface, look for the **"Download Code"** or **"Export"** button
2. Download the ZIP file containing your project
3. Extract the ZIP file on your local machine
4. You should see two main folders:
   ```
   flight380/
   ├── backend/
   │   ├── server.py
   │   ├── amadeus_service.py
   │   ├── requirements.txt
   │   └── .env (DO NOT upload - recreate on server)
   └── frontend/
       ├── src/
       ├── public/
       ├── package.json
       └── .env (DO NOT upload - recreate on server)
   ```

---

## Step 2: Prepare Your VPS

### 2.1 Connect to VPS via SSH
```bash
ssh root@YOUR_SERVER_IP
# Or use Plesk terminal
```

### 2.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Create Application Directory
```bash
mkdir -p /var/www/flight380
cd /var/www/flight380
```

### 2.4 Create Application User (Recommended)
```bash
sudo useradd -m -s /bin/bash flight380user
sudo chown -R flight380user:flight380user /var/www/flight380
```

---

## Step 3: Install Required Software

### 3.1 Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v18.x.x
npm --version
```

### 3.2 Install Yarn
```bash
sudo npm install -g yarn
yarn --version
```

### 3.3 Install Python 3.9+
```bash
sudo apt install -y python3 python3-pip python3-venv
python3 --version  # Should show 3.9+
```

### 3.4 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 --version
```

### 3.5 Install Supervisor (for Python)
```bash
sudo apt install -y supervisor
sudo systemctl enable supervisor
sudo systemctl start supervisor
```

---

## Step 4: Set Up MongoDB

### Option A: Install MongoDB Locally (Recommended for VPS)
```bash
# Import MongoDB GPG key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
mongosh --eval "db.runCommand({ ping: 1 })"
```

### Option B: Use MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/flight380_db
   ```
4. Whitelist your VPS IP address in Atlas Network Access

---

## Step 5: Deploy Backend (FastAPI)

### 5.1 Upload Backend Files
Using SFTP/SCP or Plesk File Manager:
```bash
# From your local machine
scp -r backend/* root@YOUR_SERVER_IP:/var/www/flight380/backend/
```

Or via Plesk:
1. Go to **Files** in Plesk
2. Navigate to `/var/www/flight380/`
3. Create `backend` folder
4. Upload all backend files

### 5.2 Create Python Virtual Environment
```bash
cd /var/www/flight380/backend
python3 -m venv venv
source venv/bin/activate
```

### 5.3 Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt

# Install emergent integrations (if needed)
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

### 5.4 Create Backend .env File
```bash
nano /var/www/flight380/backend/.env
```

Add the following (update with your values):
```env
# MongoDB Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="flight380_db"

# Amadeus API Credentials
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
AMADEUS_HOSTNAME=test

# CORS Configuration
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# SMTP Email Settings
SMTP_HOST=smtp.ionos.co.uk
SMTP_PORT=587
SMTP_USERNAME=noreply@flight380.co.uk
SMTP_PASSWORD=your_smtp_password
SENDER_EMAIL=noreply@flight380.co.uk
COMPANY_EMAIL=info@flight380.co.uk

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### 5.5 Test Backend Manually
```bash
cd /var/www/flight380/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
```

Test in browser: `http://YOUR_SERVER_IP:8001/api/health`

Press `Ctrl+C` to stop after testing.

### 5.6 Create Supervisor Config for Backend
```bash
sudo nano /etc/supervisor/conf.d/flight380-backend.conf
```

Add:
```ini
[program:flight380-backend]
command=/var/www/flight380/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
directory=/var/www/flight380/backend
user=flight380user
autostart=true
autorestart=true
stderr_logfile=/var/log/flight380/backend.err.log
stdout_logfile=/var/log/flight380/backend.out.log
environment=PATH="/var/www/flight380/backend/venv/bin"
```

Create log directory and start:
```bash
sudo mkdir -p /var/log/flight380
sudo chown -R flight380user:flight380user /var/log/flight380
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start flight380-backend
sudo supervisorctl status flight380-backend
```

---

## Step 6: Deploy Frontend (React)

### 6.1 Upload Frontend Files
```bash
# From your local machine
scp -r frontend/* root@YOUR_SERVER_IP:/var/www/flight380/frontend/
```

### 6.2 Create Frontend .env File
```bash
nano /var/www/flight380/frontend/.env
```

Add (update with your domain):
```env
REACT_APP_BACKEND_URL=https://yourdomain.com
```

### 6.3 Install Dependencies and Build
```bash
cd /var/www/flight380/frontend
yarn install
yarn build
```

This creates a `build` folder with production-ready static files.

### 6.4 Move Build to Web Directory
```bash
# Create web directory
sudo mkdir -p /var/www/vhosts/yourdomain.com/httpdocs

# Copy build files
sudo cp -r /var/www/flight380/frontend/build/* /var/www/vhosts/yourdomain.com/httpdocs/

# Set permissions
sudo chown -R www-data:www-data /var/www/vhosts/yourdomain.com/httpdocs/
```

---

## Step 7: Configure Nginx Reverse Proxy

### 7.1 Via Plesk (Recommended)
1. Go to **Websites & Domains** in Plesk
2. Select your domain
3. Click **Apache & nginx Settings**
4. In **Additional nginx directives**, add:

```nginx
# Backend API Proxy
location /api/ {
    proxy_pass http://127.0.0.1:8001/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
}

# Frontend SPA Routing
location / {
    try_files $uri $uri/ /index.html;
}
```

### 7.2 Manual Nginx Config (Alternative)
```bash
sudo nano /etc/nginx/sites-available/flight380
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/vhosts/yourdomain.com/httpdocs;
    index index.html;

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/flight380 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 8: SSL Certificate Setup

### Via Plesk (Easiest)
1. Go to **Websites & Domains**
2. Click on **SSL/TLS Certificates**
3. Click **Install** under Let's Encrypt
4. Select your domain
5. Click **Get it free**

### Via Certbot (Manual)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Step 9: Process Management with PM2

### Alternative to Supervisor (for Backend)
```bash
cd /var/www/flight380/backend
source venv/bin/activate

# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [{
    name: 'flight380-backend',
    script: 'uvicorn',
    args: 'server:app --host 0.0.0.0 --port 8001 --workers 4',
    interpreter: '/var/www/flight380/backend/venv/bin/python',
    cwd: '/var/www/flight380/backend',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URL | MongoDB connection string | mongodb://localhost:27017 |
| DB_NAME | Database name | flight380_db |
| AMADEUS_API_KEY | Amadeus API key | your_key |
| AMADEUS_API_SECRET | Amadeus API secret | your_secret |
| AMADEUS_HOSTNAME | test or production | test |
| CORS_ORIGINS | Allowed origins | https://yourdomain.com |
| SMTP_HOST | SMTP server | smtp.ionos.co.uk |
| SMTP_PORT | SMTP port | 587 |
| SMTP_USERNAME | SMTP username | noreply@yourdomain.com |
| SMTP_PASSWORD | SMTP password | your_password |
| JWT_SECRET | JWT signing secret | random_string |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_BACKEND_URL | Backend API URL | https://yourdomain.com |

---

## Troubleshooting

### Check Backend Logs
```bash
sudo tail -f /var/log/flight380/backend.err.log
sudo tail -f /var/log/flight380/backend.out.log
# Or via supervisor
sudo supervisorctl tail -f flight380-backend
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check MongoDB Status
```bash
sudo systemctl status mongod
mongosh --eval "db.runCommand({ ping: 1 })"
```

### Restart Services
```bash
# Backend
sudo supervisorctl restart flight380-backend

# Nginx
sudo systemctl restart nginx

# MongoDB
sudo systemctl restart mongod
```

### Common Issues

**Issue: 502 Bad Gateway**
- Check if backend is running: `sudo supervisorctl status flight380-backend`
- Check backend logs for errors
- Verify port 8001 is correct in nginx config

**Issue: CORS Errors**
- Update `CORS_ORIGINS` in backend `.env` to include your domain
- Restart backend after changes

**Issue: MongoDB Connection Failed**
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check MONGO_URL in `.env`
- If using Atlas, verify IP whitelist

**Issue: Frontend API Calls Failing**
- Verify `REACT_APP_BACKEND_URL` matches your domain
- Rebuild frontend after changing `.env`: `yarn build`
- Check browser console for specific errors

**Issue: SSL Certificate Not Working**
- Run: `sudo certbot renew --dry-run`
- Check Plesk SSL settings
- Verify DNS is pointing to correct IP

---

## Quick Commands Reference

```bash
# Check all services status
sudo supervisorctl status
sudo systemctl status nginx
sudo systemctl status mongod

# View logs
sudo tail -100 /var/log/flight380/backend.err.log
sudo tail -100 /var/log/nginx/error.log

# Restart everything
sudo supervisorctl restart flight380-backend
sudo systemctl restart nginx

# Rebuild frontend (after changes)
cd /var/www/flight380/frontend
yarn build
sudo cp -r build/* /var/www/vhosts/yourdomain.com/httpdocs/
```

---

## Support

If you encounter issues during deployment:
1. Check the troubleshooting section above
2. Review server logs for specific errors
3. Ensure all environment variables are correctly set
4. Verify firewall allows ports 80, 443, and 8001

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Application**: Flight380 Flight Booking System
