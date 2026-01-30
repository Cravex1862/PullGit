#!/bin/bash

# Node.js + Nginx Setup Script
# This script sets up a Node.js application with Nginx as reverse proxy

set -e

echo "================================"
echo "Node.js + Nginx Setup"
echo "================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run this script as root"
  exit 1
fi

# Variables (customize as needed)
APP_NAME="${1:-app}"
APP_PORT="${2:-3000}"
APP_DIR="${3:-.}"

echo "Setting up Node.js application: $APP_NAME"
echo "Port: $APP_PORT"
echo "Directory: $APP_DIR"

# Install Node.js if not exists
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Install npm dependencies
if [ -f "$APP_DIR/package.json" ]; then
    echo "Installing npm dependencies..."
    cd "$APP_DIR"
    npm install --production
fi

# Install Nginx if not exists
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Create Nginx configuration
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/$APP_NAME << EOF
upstream $APP_NAME {
    server localhost:$APP_PORT;
}

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://$APP_NAME;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

echo "================================"
echo "Setup complete!"
echo "Your Node.js app should be running on port $APP_PORT"
echo "Nginx is configured to proxy to http://localhost:$APP_PORT"
echo "================================"
