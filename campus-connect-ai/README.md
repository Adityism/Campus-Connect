# Campus Connect AI

A comprehensive platform for UPES students and faculty to access campus resources and services.

## Features
- Faculty Directory
- Campus Services Information
- Smart Search
- FAQs
- Announcements

## Setup Instructions

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd campus-connect-ai/backend
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Install Ollama and pull Llama 3:
   ```bash
   # Install Ollama (if not already installed)
   curl https://ollama.ai/install.sh | sh
   
   # Pull Llama 3 model
   ollama pull llama3
   ```
5. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
6. Run the development server:
   ```bash
   python app.py
   ```
7. Access the application at `http://localhost:5000`

## Project Structure

```
campus-connect-ai/
├── backend/
│   ├── app.py
│   ├── knowledge_base.json
│   ├── requirements.txt
│   └── migrations/
├── frontend/
│   ├── templates/
│   │   └── index.html
│   └── static/
│       ├── css/
│       │   └── styles.css
│       ├── js/
│       │   └── script.js
│       └── images/
└── README.md
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeatureName`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeatureName`)
5. Create a new Pull Request
cd campus-connect-ai/backend && flask run
pkill -f "flask run" && cd campus-connect-ai/backend && --port=5001 --debug --cert=ssl/cert.pem --key=ssl/key.pem
cd campus-connect-ai/backend && flask run --port=5001 --debug --cert=ssl/cert.pem --key=ssl/key.pem
curl -X POST http://127.0.0.1:5000/api/query -H "Content-Type: application/json" -d '{"prompt": "tell me about UPES college india ?"}'
cd campus-connect-ai/backend && flask run --port=5001