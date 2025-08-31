#!/bin/bash
# Exit on error
set -o errexit

# Install dependencies if not already installed
pip install gunicorn uvicorn[standard] fastapi websockets

# Run the FastAPI app with Gunicorn
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.app.main:app --bind 0.0.0.0:$PORT
