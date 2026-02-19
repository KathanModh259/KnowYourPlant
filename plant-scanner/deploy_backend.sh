#!/bin/bash

# deploy_backend.sh
# Run this script on your Ubuntu EC2 instance to set up the backend.

echo "Updating system..."
sudo apt update && sudo apt upgrade -y

echo "Installing Python and pip..."
sudo apt install -y python3-pip python3-venv

echo "Creating virtual environment..."
# Assuming we are in the 'plant-scanner' root directory
cd ~/plant-scanner/backend || cd backend
python3 -m venv venv
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Starting FastAPI app..."
# Run with nohup to keep it running after disconnect
# Using 0.0.0.0 to allow external access
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &

echo "Backend started! Check app.log for output."
echo "Your app is running on port 8000."
