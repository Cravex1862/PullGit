#!/bin/bash

# Node.js + Nginx Restart Script
# This script restarts the Node.js application and Nginx

APP_NAME="${1:-app}"
APP_DIR="${2:-.}"

echo "Restarting $APP_NAME..."

# Restart Nginx
systemctl restart nginx

# Restart Node.js app (using PM2 or direct)
if command -v pm2 &> /dev/null; then
    cd "$APP_DIR"
    pm2 restart $APP_NAME
    echo "Node.js app restarted with PM2"
else
    # If PM2 not available, you may need to start the app manually
    echo "Warning: PM2 not found. Please ensure your Node.js app is running."
fi

echo "Restart complete!"
