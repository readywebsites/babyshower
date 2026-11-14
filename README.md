# Royal Gujarati Baby Shower Web Application

A full-width interactive royal Gujarati baby shower celebration invitation web application built with **Django**, **Tailwind CSS**, and **SQLite**.

Designed for: **Rajil & Khushbu's Srimant Sanskar / Baby Shower**  
Deployment Domain: **`invitation.biz499.com`**

---

## 🌟 Key Features

1. **Full-Width Hero Section with Video Scrubbing**:
   - High-fidelity forward/backward video scrubbing synchronized to scroll positions.
   - Dedicated desktop video (`animate hero.mp4`) and mobile vertical video (`animate hero vertical.mp4`).
2. **Royal Heritage Aesthetics**:
   - Folded ivory silk drape background, gold foil typography, marigold garlands, and ambient floating rose petals.
   - Dynamic Gujarati typography: *"શ્રીમંત સંસ્કાર"*, *"પહોંચી જાજો"*, *"Time Par"*.
3. **Interactive Photo Flip Animations**:
   - Automatic pose transition between Namaste & Masti mode based on scroll position.
   - Couple, Dada-Dadi, Brother & Bhabhi cards.
4. **Royal Mahaprasad Feast (12:30 PM)**:
   - Dedicated grand dining section featuring an authentic unlimited Gujarati Thali starting sharp at 12:30 PM.
5. **Interactive Live Guest Polling**:
   - Real-time Boy vs. Girl gender guess poll powered by live SQLite database API (`/api/poll`).
6. **Live Digital Blessings & Guest Wishes**:
   - Dynamic guest wishing wall with heart reactions (`/api/wishes`).
7. **Instant RSVP Modal**:
   - Guests can confirm attendance, guest count, and veg preferences (`/api/rsvps`).
8. **Ambient Shehnai / Background Music**:
   - Autoplay on first user interaction with floating audio controls.
9. **SEO & Social Sharing Ready**:
   - Rich OpenGraph and Twitter card previews for WhatsApp, Instagram, Facebook, and iMessage.

---

## 🚀 Server Deployment Instructions (Ubuntu + Nginx + Gunicorn + SQLite)

### Option 1: 1-Click Automated Script

On your Ubuntu server (`invitation.biz499.com`):

```bash
# Clone the repository
sudo git clone https://github.com/readywebsites/babyshower.git /var/www/babyshower
cd /var/www/babyshower

# Run deployment script
sudo bash deploy.sh
```

---

### Option 2: Step-by-Step Manual Deployment

#### 1. Clone repository & Install System Packages
```bash
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv nginx sqlite3 certbot python3-certbot-nginx

sudo git clone https://github.com/readywebsites/babyshower.git /var/www/babyshower
cd /var/www/babyshower
```

#### 2. Virtual Environment & Python Packages
```bash
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt
```

#### 3. Django Migrations & Static Collection
```bash
./venv/bin/python manage.py migrate --noinput
./venv/bin/python manage.py collectstatic --noinput
```

#### 4. Configure File Permissions
```bash
sudo chown -R www-data:www-data /var/www/babyshower
sudo chmod -R 775 /var/www/babyshower
sudo chmod 664 /var/www/babyshower/db.sqlite3 || true
```

#### 5. Configure Gunicorn Systemd Service
```bash
sudo cp babyshower.service /etc/systemd/system/babyshower.service
sudo systemctl daemon-reload
sudo systemctl enable --now babyshower
```

#### 6. Configure Nginx Reverse Proxy
```bash
sudo cp nginx.conf /etc/nginx/sites-available/babyshower
sudo ln -sf /etc/nginx/sites-available/babyshower /etc/nginx/sites-enabled/babyshower
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Free SSL Certificate (HTTPS)
```bash
sudo certbot --nginx -d invitation.biz499.com
```

---

## 🛠 Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start local server
python manage.py runserver 0.0.0.0:8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.
