# SmartFarm API Deployment Guide

This guide explains how to deploy the SmartFarm API to Render.

## Prerequisites

- A Render account (https://render.com/)
- Git installed locally
- Python 3.8+ and pip installed locally

## Deployment Steps

### 1. Update Dependencies

Make sure these are in your `requirements.txt`:

```
dj-database-url==2.1.0
whitenoise==6.6.0
gunicorn==21.2.0
psycopg2-binary==2.9.9  # For PostgreSQL
python-dotenv==1.0.0
```

### 2. Configure Environment Variables

Set these environment variables in your Render dashboard:

```
# Required
DJANGO_SETTINGS_MODULE=smartfarm.settings.production
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=your-render-app-url.onrender.com,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://your-render-app-url.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend-url.com,http://localhost:3000

# Database (for SQLite, use this format)
DATABASE_URL=sqlite:///db.sqlite3

# Optional (for email)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=your-email@example.com
```

### 3. Update `settings/base.py`

Make sure your base settings include:

```python
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ... other settings ...

# Allow all hosts in development
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# CORS settings
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOW_CREDENTIALS = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ... rest of your settings ...
```

### 4. Create `Procfile`

Create a `Procfile` in your project root:

```
web: gunicorn smartfarm.wsgi:application --log-file -
release: python manage.py migrate && python manage.py seed_roles && python manage.py seed_crops
```

### 5. Deploy to Render

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Render dashboard
3. Click "New" and select "Blueprint"
4. Connect your repository
5. Select the repository and click "Next"
6. Review the configuration and click "Apply"

### 6. Post-Deployment Tasks

After deployment, run these commands in the Render shell:

```bash
# Create superuser
python manage.py createsuperuser

# Seed initial data
python manage.py seed_roles
python manage.py seed_crops
python manage.py seed_market_prices
python manage.py seed_suppliers_sample

# Collect static files (should happen automatically during build)
python manage.py collectstatic --noinput
```

## Maintenance

### Environment Variables

Update environment variables in the Render dashboard under your service's "Environment" tab.

### Logs

View logs in the Render dashboard under your service's "Logs" tab.

### Database Backups

For production, set up automated database backups in the Render dashboard.

## Troubleshooting

- **Static files not loading**: Check that `collectstatic` ran during build
- **Database connection issues**: Verify `DATABASE_URL` is correctly set
- **CORS errors**: Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL
- **CSRF errors**: Verify `CSRF_TRUSTED_ORIGINS` includes your domain with `https://`

## Scaling

For production traffic:
1. Upgrade to a paid plan
2. Increase the number of instances
3. Consider using a managed PostgreSQL database
4. Set up a CDN for static files

## Monitoring

For production, consider adding:
- Error tracking (Sentry, Rollbar)
- Performance monitoring (New Relic, Datadog)
- Log aggregation (LogDNA, Papertrail)
