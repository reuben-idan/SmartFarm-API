#!/bin/bash

# Exit on error
set -e

# Navigate to the project root
cd "$(dirname "$0")/.."

# Set environment variables
export NODE_ENV=production

# Navigate to the frontend directory
cd frontend

echo "=== Starting frontend build process ==="

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm ci --prefer-offline --no-audit
else
  echo "Using existing node_modules/"
fi

# Build the frontend
echo "Building frontend for production..."
npm run build

# Create static directory if it doesn't exist
STATIC_DIR="../static"
echo "Preparing static files directory at $STATIC_DIR..."
rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"

# Copy build files to static directory
echo "Copying build files to static directory..."
cp -r "dist/"* "$STATIC_DIR/"

# Ensure proper permissions for deployment
chmod -R 755 "$STATIC_DIR"

echo "=== Frontend build completed successfully ==="
echo "Static files are available in: $(pwd)/$STATIC_DIR"

echo "Frontend build complete!"
