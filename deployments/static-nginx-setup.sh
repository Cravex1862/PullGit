#!/bin/bash

# Static Site + Nginx Setup Script

set -e

echo "================================"
echo "Static Site + Nginx Setup"
echo "================================"

if [ "$EUID" -ne 0 ]; then 
  echo "Please run this script as root"
  exit 1
fi

SITE_NAME="${1:-site}"
SITE_DIR="${2:-.}"

echo "Setting up static site with Nginx"
echo "Site name: $SITE_NAME"
echo "Directory: $SITE_DIR"

# Install Nginx if not exists
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

# Create site directory
WEB_ROOT="/var/www/$SITE_NAME"
mkdir -p "$WEB_ROOT"

# Copy files
cp -r "$SITE_DIR"/* "$WEB_ROOT/" 2>/dev/null || true

# Set permissions
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# Configure Nginx
cat > /etc/nginx/sites-available/$SITE_NAME << EOF
server {
    listen 80;
    server_name _;

    root $WEB_ROOT;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    error_page 404 /404.html;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$SITE_NAME /etc/nginx/sites-enabled/$SITE_NAME
rm -f /etc/nginx/sites-enabled/default

# Test and restart
nginx -t
systemctl restart nginx

echo "================================"
echo "Setup complete!"
echo "Static site is running at http://localhost"
echo "Files location: $WEB_ROOT"
echo "================================"
