#!/bin/bash
# Setup script for Python PDF Parser microservice

echo "Setting up Python PDF Parser microservice..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "Python 3 found: $(python3 --version)"

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the service:"
echo "  1. Activate the virtual environment: source venv/bin/activate"
echo "  2. Run the service: python app.py"
echo ""
echo "The service will be available at http://localhost:5000"
