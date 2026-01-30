#!/bin/bash

# Python Flask + Nginx Restart Script

APP_NAME="${1:-app}"

echo "Restarting Flask app..."
systemctl restart $APP_NAME
systemctl restart nginx

echo "Restart complete!"
