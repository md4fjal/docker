next js deploy on vps

Phase 1: VPS Initial Setup

Step 1: Connect to Your VPS
ssh root@your-server-ip

Step 2: Update System & Create New User
# Update packages
sudo apt update && sudo apt upgrade -y

Step 3: Basic Security Setup
# Setup firewall
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

Phase 2: Install Required Software

Step 4: Install Node.js & npm & git

# Install Git
sudo apt install git -y

# Verify Git installation
git --version

# Using NodeSource for Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# Verify installation
node --version
npm --version

Step 5: Install Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

Step 6: Install PM2 (Process Manager)
sudo npm install -g pm2

Step 7: Install MongoDB

# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Create list file
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update & install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start & enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod


Step 7: Clone Your Repository
# Navigate to home directory
cd ~

# Clone your GitHub repo
git clone https://github.com/yourusername/your-repo.git

# Navigate to app directory
cd your-repo

# Install dependencies
npm install

Step 8: Build Your Next.js App
# Build for production
npm run build

# Test the build
npm start
# Press Ctrl+C to stop

Step 9: Configure PM2 to Run Your App
# Start with PM2
pm2 start npm --name "next-app" -- start

# Save PM2 process list
pm2 save

# Setup startup script
pm2 startup systemd
# Run the command provided by above command

Phase 4: Nginx Configuration

Step 10: Create Nginx Configuration
sudo nano /etc/nginx/sites-available/next-app
Add this configuration:

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Next.js specific optimizations
    location /_next/static {
        proxy_cache static;
        proxy_pass http://localhost:3000;
        expires 365d;
        access_log off;
    }
    
    location /static {
        proxy_cache static;
        proxy_pass http://localhost:3000;
        expires 365d;
        access_log off;
    }
}

Step 11: Enable the Site
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/next-app /etc/nginx/sites-enabled/

# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

Phase 5: Domain & DNS Configuration

Step 12: Point Domain to VPS
1. Go to your domain registrar's dashboard
2. Navigate to DNS settings
3. Add/Edit A records:
Type: A | Name: @ | Value: your-server-ip | TTL: Auto
Type: A | Name: www | Value: your-server-ip | TTL: Auto

Step 13: Verify Domain Resolution
# On your local machine
ping your-domain.com
nslookup your-domain.com

Phase 6: SSL Certificate with Let's Encrypt

Step 14: Install Certbot
sudo apt install certbot python3-certbot-nginx -y

Step 15: Obtain SSL Certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
Follow the prompts:
Enter your email
Agree to terms
Choose whether to redirect HTTP to HTTPS (recommended: 2)

Step 16: Auto-renewal Setup
Certbot automatically sets up a cron job. Verify:
sudo certbot renew --dry-run

Phase 7: Final Configuration & Optimization

Step 17: Update Nginx SSL Configuration
Your Nginx config will be updated automatically by Certbot. Verify:
sudo nano /etc/nginx/sites-available/next-app

Step 18: Configure Environment Variables (if needed)
# Create .env.production in your app directory
cd ~/your-repo
nano .env.production

# Add your environment variables
NEXT_PUBLIC_API_URL=https://api.your-domain.com
# ... other variables

# Restart PM2 to pick up new env variables
pm2 restart next-app



### React 

npm install
npm run build
sudo apt update
sudo apt install nginx -y
sudo systemctl status nginx
sudo nano /etc/nginx/sites-available/myapp
sudo nano /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/myapp/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}

sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run

###wordpress

1️⃣ Upload files to VPS

From your local machine:

scp topgenuine.zip top_genuine_db.sql user@YOUR_VPS_IP:/home/user/

✅ Check
ls -lh


You should see:

topgenuine.zip
top_genuine_db.sql

2️⃣ Install required packages (PHP + MySQL)
Install PHP (recommended for WordPress)
sudo apt update
sudo apt install -y php php-fpm php-mysql php-cli php-curl php-gd php-mbstring php-xml php-zip unzip

Install MySQL
sudo apt install -y mysql-server

✅ Check
php -v
mysql --version
systemctl status php*-fpm

3️⃣ Create WordPress directory
sudo mkdir -p /var/www/topgenuine
sudo chown -R $USER:$USER /var/www/topgenuine


Extract files:

unzip topgenuine.zip -d /var/www/topgenuine

✅ Check
ls /var/www/topgenuine


You must see:

wp-admin
wp-content
wp-includes
wp-config.php
index.php


(Your screenshot confirms this is correct ✔)

4️⃣ Create MySQL database & user

Login to MySQL:

sudo mysql


Run:

CREATE DATABASE topgenuine_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'topgenuine_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';

GRANT ALL PRIVILEGES ON topgenuine_db.* TO 'topgenuine_user'@'localhost';

FLUSH PRIVILEGES;
EXIT;

5️⃣ Import database dump
mysql -u topgenuine_user -p topgenuine_db < top_genuine_db.sql


Enter the password.

✅ Check
mysql -u topgenuine_user -p

USE topgenuine_db;
SHOW TABLES;
EXIT;


You should see WordPress tables like:

wp_posts
wp_users
wp_options

6️⃣ Configure wp-config.php

Edit:

nano /var/www/topgenuine/wp-config.php


Update these values:

define('DB_NAME', 'topgenuine_db');
define('DB_USER', 'topgenuine_user');
define('DB_PASSWORD', 'STRONG_PASSWORD');
define('DB_HOST', 'localhost');


(Optional but recommended)

define('FS_METHOD', 'direct');
define('WP_MEMORY_LIMIT', '256M');


Save and exit.

✅ Check
php -l /var/www/topgenuine/wp-config.php


Must say:

No syntax errors detected

7️⃣ Fix permissions (CRITICAL)
sudo chown -R www-data:www-data /var/www/topgenuine
sudo find /var/www/topgenuine -type d -exec chmod 755 {} \;
sudo find /var/www/topgenuine -type f -exec chmod 644 {} \;

8️⃣ Create Nginx server block

Create config:

sudo nano /etc/nginx/sites-available/topgenuine


Paste this FULL config:

server {
    listen 80;
    server_name topgenuine.com www.topgenuine.com;

    root /var/www/topgenuine;
    index index.php index.html;

    access_log /var/log/nginx/topgenuine.access.log;
    error_log /var/log/nginx/topgenuine.error.log;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
    }

    location ~* \.(jpg|jpeg|png|gif|css|js|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        log_not_found off;
    }

    location ~ /\. {
        deny all;
    }
}


⚠ If PHP version differs:

ls /var/run/php/


Replace php-fpm.sock accordingly (e.g. php8.1-fpm.sock).

9️⃣ Enable site & reload Nginx
sudo ln -s /etc/nginx/sites-available/topgenuine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

✅ Check
sudo systemctl status nginx

🔟 Fix WordPress site URL (VERY IMPORTANT)

If your site shows redirect issues, run:

mysql -u topgenuine_user -p topgenuine_db

SELECT option_name, option_value 
FROM wp_options 
WHERE option_name IN ('siteurl','home');


Update if needed:

UPDATE wp_options 
SET option_value='https://topgenuine.com'
WHERE option_name IN ('siteurl','home');
EXIT;

1️⃣1️⃣ Visit website 🎉

Open browser:

http://YOUR_DOMAIN


You should see:

Homepage ✔

/wp-admin ✔

Admin login:

Credentials are from your imported database, not new install.

1️⃣2️⃣ Enable SSL (Recommended)

If domain is pointing to VPS:

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d topgenuine.com -d www.topgenuine.com

✅ Check
curl -I https://topgenuine.com
