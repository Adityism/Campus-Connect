# Campus Connect AI

Campus Connect AI is a full-stack platform designed to enhance campus engagement using AI-powered features. It includes a Flask backend, a modern frontend, and AI/ML integrations for chat, analytics, and more.

## Features
- AI-powered chat assistant for students and faculty
- Faculty portal with authentication
- Analytics dashboard
- Internship and placement modules
- Secure SSL support
- Knowledge base integration
- Modular frontend and backend structure

## Project Structure
```
campus-connect-ai/
├── backend/
│   ├── ai_model.py
│   ├── app.py
│   ├── run.py
│   ├── requirements.txt
│   ├── static/
│   ├── templates/
│   └── ...
├── frontend/
│   ├── src/
│   ├── static/
│   ├── templates/
│   └── ...
├── knowledge_base.json
├── README.md
└── ...
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js (for frontend, if using npm/yarn)
- pip (Python package manager)
- (Optional) Ollama for LLM integration

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd campus-connect-ai/backend
   ```
2. (Recommended) Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask app:
   ```bash
   python run.py
   # or
   ./start_flask.sh
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd campus-connect-ai/frontend
   ```
2. Install dependencies (if using npm):
   ```bash
   npm install
   ```
3. Start the frontend server (if applicable):
   ```bash
   npm start
   ```

### Environment Variables
- Store sensitive information in `.env` files (not tracked by git).
- Example variables:
  - `SECRET_KEY`
  - `DATABASE_URL`
  - `OPENAI_API_KEY`

### SSL Certificates
- Place your SSL certificates in `backend/ssl/` or as specified in your config.

### Knowledge Base
- The knowledge base is stored in `knowledge_base.json`.

## Deployment
- For production, configure environment variables and SSL certificates properly.
- Use a production-ready server (e.g., Gunicorn, Nginx) for deployment.

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your branch
5. Open a pull request

## License
This project is licensed under the MIT License.

## Acknowledgements
- Flask
- Node.js
- Ollama
- OpenAI
- UPES
