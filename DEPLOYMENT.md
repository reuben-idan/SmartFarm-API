# SmartFarm Deployment Guide

This guide provides instructions for deploying the SmartFarm platform in a production environment.

## Prerequisites

- Linux server (Ubuntu 22.04 recommended)
- Domain name with DNS configured
- PostgreSQL 13+
- Redis 6+
- Python 3.10+
- Node.js 18+
- Nginx
- Certbot (for SSL certificates)
- Supervisor (for process management)

## Server Setup

### 1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget build-essential libpq-dev python3-dev
```

### 2. Install and Configure PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE smartfarm;"
sudo -u postgres psql -c "CREATE USER smartfarmuser WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "ALTER ROLE smartfarmuser SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE smartfarmuser SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE smartfarmuser SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE smartfarm TO smartfarmuser;"
```

### 3. Install and Configure Redis

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 4. Install Python and Node.js

```bash
# Install Python 3.10
sudo apt install -y python3.10 python3.10-venv python3-pip

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## Application Setup

### 1. Clone the Repository

```bash
# Create project directory
sudo mkdir -p /var/www/smartfarm
sudo chown -R $USER:$USER /var/www/smartfarm

# Clone the repository
git clone https://github.com/yourusername/smartfarm-api.git /var/www/smartfarm
cd /var/www/smartfarm
```

### 2. Set Up Python Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r backend/requirements/production.txt
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
nano .env  # Edit with your production settings
```

Example production `.env`:

```env
# Django
DEBUG=False
SECRET_KEY=your-secret-key-here
DJANGO_ENV=production
ALLOWED_HOSTS=.yourdomain.com

# Database
DB_NAME=smartfarm
DB_USER=smartfarmuser
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here
ACCESS_TOKEN_LIFETIME=3600
REFRESH_TOKEN_LIFETIME=86400

# Email (configure with your email provider)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=webmaster@yourdomain.com
SERVER_EMAIL=webmaster@yourdomain.com

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Sentry (optional)
# SENTRY_DSN=your-sentry-dsn
```

### 5. Run Database Migrations

```bash
cd /var/www/smartfarm/backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 6. Build Frontend

```bash
cd /var/www/smartfarm/frontend
npm install
npm run build
```

## Configure Nginx

### 1. Install Nginx

```bash
sudo apt install -y nginx
```

### 2. Create Nginx Configuration

Create a new file at `/etc/nginx/sites-available/smartfarm`:

```nginx
upstream django {
    server unix:/run/smartfarm.sock;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Static files
    location /static/ {
        alias /var/www/smartfarm/backend/staticfiles/;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Media files
    location /media/ {
        alias /var/www/smartfarm/backend/media/;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # API
    location /api/ {
        try_files $uri @proxy_to_app;
    }
    
    # Admin
    location /admin/ {
        try_files $uri @proxy_to_app;
    }
    
    # Django admin static files
    location /static/admin/ {
        alias /var/www/smartfarm/venv/lib/python3.10/site-packages/django/contrib/admin/static/admin/;
    }
    
    # Frontend
    location / {
        root /var/www/smartfarm/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location @proxy_to_app {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_pass http://django;
    }
    
    # Error pages
    error_page 500 502 503 504 /500.html;
    location = /500.html {
        root /var/www/smartfarm/frontend/dist;
    }
}
```

### 3. Enable the Site and Test Configuration

```bash
sudo ln -s /etc/nginx/sites-available/smartfarm /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## Set Up SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Configure Supervisor

### 1. Install Supervisor

```bash
sudo apt install -y supervisor
```

### 2. Create Supervisor Configuration

Create a new file at `/etc/supervisor/conf.d/smartfarm.conf`:

```ini
[program:smartfarm]
directory=/var/www/smartfarm/backend
command=/var/www/smartfarm/venv/bin/gunicorn config.wsgi:application --bind unix:/run/smartfarm.sock
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/smartfarm/error.log
stdout_logfile=/var/log/smartfarm/access.log

[program:celery]
directory=/var/www/smartfarm/backend
command=/var/www/smartfarm/venv/bin/celery -A config worker --loglevel=info
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/smartfarm/celery_error.log
stdout_logfile=/var/log/smartfarm/celery_worker.log

[program:celery_beat]
directory=/var/www/smartfarm/backend
command=/var/www/smartfarm/venv/bin/celery -A config beat --loglevel=info
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/smartfarm/celery_beat_error.log
stdout_logfile=/var/log/smartfarm/celery_beat.log
```

### 3. Create Log Directory and Set Permissions

```bash
sudo mkdir -p /var/log/smartfarm
sudo chown -R www-data:www-data /var/log/smartfarm
sudo chown -R www-data:www-data /var/www/smartfarm
```

### 4. Start Supervisor

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart all
```

## Final Steps

1. **Set Up Log Rotation**

   Create a new file at `/etc/logrotate.d/smartfarm`:

   ```
   /var/log/smartfarm/*.log {
       daily
       missingok
       rotate 14
       compress
       delaycompress
       notifempty
       create 0640 www-data www-data
       sharedscripts
       postrotate
           supervisorctl restart smartfarm celery celery_beat
       endscript
   }
   ```

2. **Set Up Automatic Renewal for SSL Certificates**

   ```bash
   sudo crontab -e
   ```

   Add the following line:
   ```
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

3. **Enable Automatic Security Updates**

   ```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

## Maintenance

### Common Commands

```bash
# Restart application
sudo supervisorctl restart smartfarm

# Restart Celery
sudo supervisorctl restart celery celery_beat

# View logs
sudo tail -f /var/log/smartfarm/error.log

# Run management commands
cd /var/www/smartfarm/backend
source ../venv/bin/activate
python manage.py shell
```

### Backing Up the Database

```bash
# Create a backup
sudo -u postgres pg_dump smartfarm > /path/to/backup/smartfarm_$(date +%Y%m%d).sql

# Restore from backup
sudo -u postgres psql smartfarm < /path/to/backup/smartfarm_YYYYMMDD.sql
```

## Troubleshooting

- **502 Bad Gateway**: Check if Gunicorn is running: `sudo supervisorctl status`
- **Static files not loading**: Run `python manage.py collectstatic --noinput`
- **Database connection issues**: Verify PostgreSQL is running and credentials in `.env` are correct
- **Permission issues**: Ensure `www-data` user has proper permissions on all files and directories

## Security Considerations

1. Keep all dependencies up to date
2. Regularly backup your database
3. Monitor server logs for suspicious activity
4. Use strong passwords and API keys
5. Keep your server's operating system updated
6. Regularly review and update your security configurations

## Scaling

For higher traffic, consider:

1. Using a CDN for static files
2. Setting up database replication
3. Using a load balancer with multiple application servers
4. Implementing caching with Redis or Memcached
5. Using a managed database service

## Support

For additional help, please refer to the [documentation](https://docs.smartfarm.example.com) or [open an issue](https://github.com/yourusername/smartfarm-api/issues).
