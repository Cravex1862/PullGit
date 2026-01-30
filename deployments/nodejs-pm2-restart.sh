#!/bin/bash

# Node.js + PM2 Restart Script

APP_NAME="${1:-app}"

echo "Restarting $APP_NAME with PM2..."
pm2 restart $APP_NAME
pm2 save

echo "Restart complete!"
