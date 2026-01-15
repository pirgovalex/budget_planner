#!/bin/bash
# Start script for AI Budget Planner Backend

echo "Starting AI Budget Planner Backend..."

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r backend/requirements.txt

# Run migration (optional)
#echo "Running data migration..."
#python backend/migrate_data.py

# Start server
echo "Starting FastAPI server..."
uvicorn backend.main:app --reload --port 8000
