#!/bin/bash

# Navigate to the frontend directory
cd "$(dirname "$0")/../frontend"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

# Build the frontend
echo "Building frontend..."
npm run build

# Copy build files to static directory
echo "Copying build files..."
rm -rf "../static"
mkdir -p "../static"
cp -r "dist/"* "../static/"

echo "Frontend build complete!"
