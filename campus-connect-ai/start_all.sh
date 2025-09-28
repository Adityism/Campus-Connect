#!/bin/bash
# Campus Connect AI: All-in-one startup script
set -e

# 1. Create and activate Python virtual environment if not exists
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi
source venv/bin/activate

# 2. Install backend requirements
if [ -f "backend/requirements.txt" ]; then
  echo "Installing backend requirements..."
  pip install --upgrade pip
  pip install -r backend/requirements.txt
fi

# 3. Install Streamlit (for frontend chat UI)
pip install streamlit requests

# 4. Start Flask backend (SSL, port 5001) in background
cd backend
export FLASK_APP=app.py
nohup flask run --port=5001 --debug --cert=ssl/cert.pem --key=ssl/key.pem > ../flask.log 2>&1 &
cd ..

# 5. Start Streamlit chat UI in background
nohup streamlit run frontend/caichat.py --server.port 8505 > streamlit.log 2>&1 &

echo "Campus Connect AI backend running at: https://localhost:5001"
echo "Streamlit chat UI running at: http://localhost:8505"
echo "(Check flask.log and streamlit.log for logs)"
