#!/bin/bash

# Setup script for astro-core-python service

set -e  # Exit on error

echo "=================================="
echo "Astro Core Python - Setup"
echo "=================================="

# Check Python version
python3 --version

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
else
  echo "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Download ephemeris data
echo "Downloading JPL ephemeris data (DE421)..."
python -c "from skyfield.api import load; load('de421.bsp')" || echo "Note: Ephemeris will be downloaded on first use"

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo "=================================="
echo ""
echo "To run the service:"
echo "  1. source .venv/bin/activate"
echo "  2. python router.py"
echo ""
echo "Or use: uvicorn router:app --port 4001 --reload"
echo ""
