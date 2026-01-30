#!/bin/bash

# Node.js + PM2 Setup Script

set -e

echo "================================"
echo "Node.js + PM2 Setup"
echo "================================"

if [ "$EUID" -ne 0 ]; then 
  echo "Please run this script as root"
  exit 1
fi

APP_NAME="${1:-app}"
APP_DIR="${2:-.}"
MAIN_FILE="${3:-index.js}"

echo "Setting up Node.js app with PM2"
echo "App name: $APP_NAME"
echo "Directory: $APP_DIR"
echo "Main file: $MAIN_FILE"

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

# Install PM2 globally
npm install -g pm2

# Start app with PM2
cd "$APP_DIR"
pm2 start $MAIN_FILE --name $APP_NAME --instances max

# Save PM2 configuration
pm2 save
pm2 startup

# Create PM2 service (auto-start on reboot)
pm2 startup systemd -u root --hp /root

echo "================================"
echo "Setup complete!"
echo "App '$APP_NAME' is running with PM2"
echo "================================"
