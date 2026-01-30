#!/bin/bash

# Static Site + Nginx Restart Script

SITE_NAME="${1:-site}"

echo "Restarting Nginx..."
systemctl restart nginx

echo "Restart complete!"
