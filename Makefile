.PHONY: install run migrate createsuperuser shell test lint format check

install:
	pip install -r requirements.txt

run:
	python manage.py runserver

migrate:
	python manage.py migrate

createsuperuser:
	python manage.py createsuperuser

shell:
	python manage.py shell

test:
	python manage.py test

lint:
	black --check .
	isort --check-only .
	flake8 .

format:
	black .
	isort .

check: lint test
