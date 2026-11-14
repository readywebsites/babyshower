#!/usr/bin/env bash
# ==============================================================================
# 1-CLICK DEPLOYMENT SCRIPT FOR UBUNTU (DJANGO + NGINX + GUNICORN + SQLITE)
# Domain: invitation.biz499.com
# Usage: sudo bash deploy.sh
# ==============================================================================

set -e

echo "--------------------------------------------------------"
echo " Starting Baby Shower Django Deployment on Ubuntu"
echo "--------------------------------------------------------"

# 1. Update system packages and install prerequisites
echo "[1/6] Installing Python, Nginx, SQLite & dependencies..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv nginx sqlite3 certbot python3-certbot-nginx

# 2. Setup project folder in /var/www/babyshower
APP_DIR="/var/www/babyshower"
echo "[2/6] Preparing application directory at $APP_DIR..."
sudo mkdir -p "$APP_DIR"

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
if [ "$CURRENT_DIR" != "$APP_DIR" ]; then
    echo "Syncing files from $CURRENT_DIR to $APP_DIR..."
    sudo cp -r "$CURRENT_DIR"/* "$APP_DIR"/
fi

cd "$APP_DIR"

# 3. Create Python Virtual Environment & Install packages
echo "[3/6] Setting up virtual environment & installing Python dependencies..."
sudo python3 -m venv venv
sudo ./venv/bin/pip install --upgrade pip
sudo ./venv/bin/pip install -r requirements.txt

# 4. Run Django Migrations & Collectstatic
echo "[4/6] Running Django migrations & static collection..."
sudo ./venv/bin/python manage.py migrate --noinput
sudo ./venv/bin/python manage.py collectstatic --noinput

# Set ownership and permissions for www-data so Gunicorn and SQLite can read/write
echo "Configuring file ownership for www-data..."
sudo chown -R www-data:www-data "$APP_DIR"
sudo chmod -R 775 "$APP_DIR"
sudo chmod 664 "$APP_DIR/db.sqlite3" || true

# 5. Configure Systemd Service
echo "[5/6] Setting up Systemd Service (babyshower.service)..."
sudo cp "$APP_DIR/babyshower.service" /etc/systemd/system/babyshower.service
sudo systemctl daemon-reload
sudo systemctl enable babyshower
sudo systemctl restart babyshower

# 6. Configure Nginx
echo "[6/6] Configuring Nginx reverse proxy..."
sudo cp "$APP_DIR/nginx.conf" /etc/nginx/sites-available/babyshower
sudo ln -sf /etc/nginx/sites-available/babyshower /etc/nginx/sites-enabled/babyshower
# Remove default Nginx welcome site if present
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "--------------------------------------------------------"
echo " DEPLOYMENT SUCCESSFUL!"
echo " Domain: https://invitation.biz499.com"
echo " Service Status: sudo systemctl status babyshower"
echo " Nginx Status:   sudo systemctl status nginx"
echo " View live logs: sudo journalctl -u babyshower -f"
echo ""
echo " To obtain a FREE SSL certificate with HTTPS, run:"
echo " sudo certbot --nginx -d invitation.biz499.com"
echo "--------------------------------------------------------"
