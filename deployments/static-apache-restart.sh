#!/bin/bash

# Static Site + Apache Restart Script

SITE_NAME="${1:-site}"

echo "Restarting Apache..."
systemctl restart apache2
echo "Apache restarted successfully!"
