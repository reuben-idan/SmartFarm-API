#!/bin/bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI app
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
