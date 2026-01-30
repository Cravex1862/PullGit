#!/bin/bash

# Static Site + Apache Setup Script
# This script sets up a static HTML/CSS/JS site with Apache

set -e

echo "================================"
echo "Static Site + Apache Setup"
echo "================================"

if [ "$EUID" -ne 0 ]; then 
  echo "Please run this script as root"
  exit 1
fi

SITE_NAME="${1:-site}"
SITE_DIR="${2:-.}"

echo "Setting up static site: $SITE_NAME"
echo "Directory: $SITE_DIR"

# Install Apache if not exists
if ! command -v apache2 &> /dev/null; then
    echo "Installing Apache2..."
    apt-get update
    apt-get install -y apache2
fi

# Enable mod_rewrite
a2enmod rewrite

# Create Apache configuration
APACHE_DIR="/var/www/$SITE_NAME"
mkdir -p "$APACHE_DIR"

# Copy files to Apache directory
cp -r "$SITE_DIR"/* "$APACHE_DIR/" 2>/dev/null || true

# Create .htaccess for URL rewriting
cat > "$APACHE_DIR/.htaccess" << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
EOF

# Set proper permissions
chown -R www-data:www-data "$APACHE_DIR"
chmod -R 755 "$APACHE_DIR"

# Create Apache virtual host
cat > /etc/apache2/sites-available/$SITE_NAME.conf << EOF
<VirtualHost *:80>
    ServerName _
    DocumentRoot $APACHE_DIR

    <Directory $APACHE_DIR>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/$SITE_NAME-error.log
    CustomLog \${APACHE_LOG_DIR}/$SITE_NAME-access.log combined
</VirtualHost>
EOF

# Enable site
a2ensite $SITE_NAME

# Disable default site
a2dissite 000-default

# Test Apache configuration
apache2ctl configtest

# Restart Apache
systemctl restart apache2

echo "================================"
echo "Setup complete!"
echo "Your static site is now running at http://localhost"
echo "Files location: $APACHE_DIR"
echo "================================"
