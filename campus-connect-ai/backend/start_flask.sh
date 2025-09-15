#!/bin/zsh
# Script to set up venv, activate it, and run Flask server with SSL

cd "$(dirname "$0")"  # Go to script's directory

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Run Flask app with SSL
flask run --port=5001 --debug --cert=ssl/cert.pem --key=ssl/key.pem
