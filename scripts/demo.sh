#!/bin/bash

# Exit on error
set -e

# Create output directory for demo files
mkdir -p docs/demo

# Run migrations and seed data
echo "Running migrations..."
python manage.py migrate
echo ""

echo "Seeding roles and permissions..."
python manage.py seed_roles
echo ""

echo "Seeding crops..."
python manage.py seed_crops
echo ""

echo "Seeding market prices..."
python manage.py seed_market_prices
echo ""

echo "Seeding sample suppliers..."
python manage.py seed_suppliers_sample
echo ""

# Create a superuser if not exists
echo "Creating superuser (if not exists)..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell
echo ""

# Get JWT token for API authentication
echo "Getting JWT token..."
TOKEN=$(curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"admin123"}' | jq -r '.access')

echo "Token: $TOKEN"
echo ""

# Function to make authenticated API requests and save output
make_request() {
  local endpoint=$1
  local output_file=$2
  echo "Fetching $endpoint..."
  curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:8000/api/$endpoint/" \
    | jq '.' > "docs/demo/$output_file"
  echo "  -> Saved to docs/demo/$output_file"
}

# Make API requests and save outputs
make_request "crops" "crops.json"
make_request "prices/market-prices" "market-prices.json"
make_request "suppliers" "suppliers.json"

# Create a summary markdown file
cat > docs/demo/README.md <<EOL
# SmartFarm API Demo Outputs

This directory contains sample JSON responses from the SmartFarm API endpoints.

## Available Demo Files

- [crops.json](crops.json) - List of available crops
- [market-prices.json](market-prices.json) - Current market prices
- [suppliers.json](suppliers.json) - Registered suppliers

## How to Use

1. Start the development server:
   ```bash
   python manage.py runserver
   ```

2. Use the demo script to generate fresh sample data:
   ```bash
   ./scripts/demo.sh
   ```

3. View the generated JSON files in this directory.

## Authentication

To make authenticated requests, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

You can obtain a token by making a POST request to `/api/token/` with username and password.
EOL

echo ""
echo "Demo setup complete! View the generated files in docs/demo/"
echo "Start the development server with: python manage.py runserver"
