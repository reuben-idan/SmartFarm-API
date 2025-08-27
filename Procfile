web: gunicorn smartfarm.wsgi:application --log-file -
release: python manage.py migrate && python manage.py collectstatic --noinput && python manage.py seed_roles && python manage.py seed_crops
