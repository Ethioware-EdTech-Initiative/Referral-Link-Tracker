#!/usr/bin/env bash
set -o errexit
echo "Starting deployment..."

# Upgrade pip
python3 -m pip install --upgrade pip

# Install dependencies
pip3 install -r requirements.txt

# Collect static files
echo "Collecting static files..."
python3 manage.py collectstatic --no-input

# Run migrations
echo "Running migrations..."
python3 manage.py migrate --no-input
