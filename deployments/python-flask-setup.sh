#!/bin/bash

# Python Flask + Nginx Setup Script

set -e

echo "================================"
echo "Python Flask + Nginx Setup"
echo "================================"

if [ "$EUID" -ne 0 ]; then 
  echo "Please run this script as root"
  exit 1
fi

APP_NAME="${1:-app}"
APP_DIR="${2:-.}"
APP_PORT="${3:-5000}"

echo "Setting up Flask app with Nginx"
echo "App name: $APP_NAME"
echo "Directory: $APP_DIR"
echo "Port: $APP_PORT"

# Install Python and pip
apt-get update
apt-get install -y python3 python3-pip python3-venv

# Install Nginx if not exists
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi

# Create virtual environment
cd "$APP_DIR"
python3 -m venv venv
source venv/bin/activate

# Install Flask and Gunicorn
pip install --upgrade pip
pip install Flask gunicorn

# Install requirements if exists
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi

# Create systemd service for Gunicorn
cat > /etc/systemd/system/$APP_NAME.service << EOF
[Unit]
Description=Gunicorn application server for $APP_NAME
After=network.target

[Service]
User=www-data
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/venv/bin/gunicorn --workers 4 --bind localhost:$APP_PORT app:app

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
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

# Enable Nginx site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
rm -f /etc/nginx/sites-enabled/default

# Test and restart
nginx -t
systemctl restart nginx

# Start Gunicorn service
systemctl daemon-reload
systemctl start $APP_NAME
systemctl enable $APP_NAME

echo "================================"
echo "Setup complete!"
echo "Flask app running on port $APP_PORT with Nginx"
echo "================================"
