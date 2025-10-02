from flask import Flask, jsonify, request, render_template, send_from_directory, redirect, url_for, session, Response, stream_with_context
from dotenv import load_dotenv
from flask_cors import CORS
from flask_dance.contrib.azure import make_azure_blueprint
from datetime import datetime, timedelta
import uuid
import json
import os
import requests
import logging
import sys
from faculty.routes import faculty_bp

# Add logging configuration
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app = Flask(__name__,
           template_folder=os.path.join(BASE_DIR, 'frontend/templates'),
           static_folder=os.path.join(BASE_DIR, 'frontend/static'))

# Load environment variables
load_dotenv()

app.secret_key = os.getenv("SECRET_KEY")

# -----------------------------------------------------------------------------
# TEMPORARY STUBS (replace with actual Firestore or DB integration)
# -----------------------------------------------------------------------------
def add_user(name, email):
    logger.info(f"Stub add_user called: {name}, {email}")
    return f"User {name} with {email} added (stubbed)"

class FakeDB:
    def collection(self, name):
        logger.info(f"Stub db.collection called: {name}")
        return []

db = FakeDB()
# -----------------------------------------------------------------------------

# Redirect /caichat to Streamlit UI
@app.route('/caichat')
def caichat_redirect():
    """Redirect /caichat to the Streamlit chat UI."""
    return redirect("http://localhost:8505", code=302)

# Route to add user
@app.route("/add_user", methods=["POST"])
def add_user_route():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    
    if not name or not email:
        return jsonify({"error": "Missing name or email"}), 400

    result = add_user(name, email)
    return jsonify({"message": result})

# Route to get users
@app.route("/get_users", methods=["GET"])
def get_users():
    users_ref = db.collection("users")
    users = []  # stubbed empty response
    return jsonify(users)

# Hugging Face API Setup (optional if using Ollama)
HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
MODEL_NAME = os.getenv("MODEL_NAME", "llama3")

HEADERS = {
    "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}",
    "Content-Type": "application/json"
}

ENDPOINT = f"https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct"

# Security headers middleware
@app.after_request
def add_security_headers(response):
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

# Microsoft OAuth Configuration
app.config["AZURE_OAUTH_CLIENT_ID"] = os.getenv("AZURE_OAUTH_CLIENT_ID")
app.config["AZURE_OAUTH_CLIENT_SECRET"] = os.getenv("AZURE_OAUTH_CLIENT_SECRET")
app.config["AZURE_OAUTH_TENANT"] = os.getenv("AZURE_OAUTH_TENANT")
app.config["OAUTHLIB_INSECURE_TRANSPORT"] = os.getenv("OAUTHLIB_INSECURE_TRANSPORT", "0")

azure_bp = make_azure_blueprint(
    client_id=app.config["AZURE_OAUTH_CLIENT_ID"],
    client_secret=app.config["AZURE_OAUTH_CLIENT_SECRET"],
    tenant=app.config["AZURE_OAUTH_TENANT"],
    redirect_to="auth_callback"
)
app.register_blueprint(azure_bp, url_prefix="/login")

# Register faculty blueprint before CORS
app.register_blueprint(faculty_bp, url_prefix='/api/faculty')

CORS(app)

# Ensure the static folder exists
if not os.path.exists('static'):
    os.makedirs('static')

# Load knowledge base
def load_knowledge_base():
    try:
        with open('knowledge_base.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Create a sample knowledge base if it doesn't exist
        sample_data = {
            "faculty": [
                {
                    "name": "Dr. Rajesh Kumar",
                    "department": "Computer Science",
                    "designation": "Professor",
                    "email": "rajesh.kumar@upes.ac.in",
                    "specialization": "Artificial Intelligence"
                }
            ],
            "services": [
                {
                    "name": "Library",
                    "location": "Academic Block A",
                    "timing": "9:00 AM - 6:00 PM",
                    "description": "State-of-the-art library with digital resources"
                }
            ],
            "faqs": [
                {
                    "question": "What are the admission requirements?",
                    "answer": "Admission requirements vary by program. Please check the specific program page for detailed requirements."
                }
            ],
            "announcements": [
                {
                    "title": "Semester Registration",
                    "date": "2024-02-17",
                    "content": "Registration for Spring 2024 semester begins next week"
                }
            ]
        }
        with open('knowledge_base.json', 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, indent=4)
        return sample_data

knowledge_base = load_knowledge_base()

@app.route('/')
def root():
    return render_template("landing.html")

@app.route('/auth/login')
def auth_login():
    login_type = request.args.get('type', 'student')
    session['login_type'] = login_type
    return redirect(url_for("azure.login"))

@app.route('/auth/callback')
def auth_callback():
    if not azure_bp.session.authorized:
        return redirect(url_for("root"))
        
    resp = azure_bp.session.get("/v1.0/me")
    if not resp.ok:
        return "Authentication failed", 400

    user_data = resp.json()
    email = user_data.get("mail") or user_data.get("userPrincipalName")
    login_type = session.get('login_type', 'student')

    session.permanent = True
    session["user"] = {
        "email": email,
        "displayName": user_data.get("displayName", email.split('@')[0]),
        "type": login_type
    }

    if login_type == 'student':
        if not email.endswith("@stu.upes.ac.in"):
            return "Access Denied: Please use your student email (@stu.upes.ac.in)", 403
        return redirect(url_for('home'))
    elif login_type == 'faculty':
        session['faculty_token'] = True
        return redirect(url_for('faculty_portal_dashboard'))

    return redirect(url_for('home'))

@app.route("/home")
def home():
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("user", {}).get("type") == "faculty":
        return redirect(url_for("faculty_portal_dashboard"))
    return render_template("index.html")

@app.route('/static/<path:filename>')
def serve_static(filename):
    try:
        app.logger.debug(f"Serving static file: {filename} from {app.static_folder}")
        return send_from_directory(app.static_folder, filename)
    except Exception as e:
        app.logger.error(f"Error serving static file {filename}: {str(e)}")
        return "File not found", 404

@app.route('/caiindex', methods=['GET'])
def caiindex():
    return render_template('caiindex.html')

@app.route('/faculty_portal')
def faculty_portal():
    if 'faculty_token' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('faculty_portal_dashboard'))

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/faculty')
def faculty():
    return render_template('faculty.html')

@app.route('/internship')
def internship():
    return render_template('internship.html')

@app.route('/api/services')
def get_services():
    return jsonify(knowledge_base.get('services', []))

@app.route('/api/faqs')
def get_faqs():
    return jsonify(knowledge_base.get('faqs', []))

@app.route('/api/announcements')
def get_announcements():
    try:
        announcements = knowledge_base.get('announcements', [])
        return jsonify(announcements)
    except Exception as e:
        logger.exception("Error fetching regular announcements")
        return jsonify({"error": str(e)}), 500

@app.route('/announcements')
def announcements():
    return render_template('announcements.html')

# ---------------- AI Query Route ----------------
from rag.query import RAG
import logging

# Load RAG instance at startup
rag = RAG.load()

@app.route('/api/query/stream', methods=['POST'])
def query_api_stream():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({'error': 'Invalid or empty JSON received'}), 400

        prompt = data.get('prompt', '')
        history = data.get('history', [])
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400

        def event_stream():
            logger.info(f"[Flask] /api/query/stream called with prompt: {prompt[:80]}")
            res = rag.ask(prompt, history=history, k=6)
            answer = res.get('answer', '')
            # Remove any citation/source chunk info from the answer
            import re
            clean_answer = re.sub(r" ?as stated in \[SOURCE.*?\]| ?\[Source:.*?\]| ?chunk: [a-f0-9]+", "", answer, flags=re.IGNORECASE)
            import time
            # Stream answer token by token (simulate streaming)
            for token in clean_answer.split():
                yield f"data: {{\"token\": \"{token} \"}}\n\n"
                time.sleep(0.03)  # Add delay for visible streaming
            # At end, do not send sources as a final event
            # (removed sources/citations from stream)
        return Response(stream_with_context(event_stream()), mimetype='text/event-stream')
    except Exception as e:
        logger.exception("Error in /api/query/stream endpoint")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

#
@app.route('/api/query', methods=['POST'])
def query_api():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({'error': 'Invalid or empty JSON received'}), 400
        prompt = data.get('prompt', '')
        history = data.get('history', [])
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        logger.info(f"[Flask] /api/query called with prompt: {prompt[:80]}")
        res = rag.ask(prompt, history=history, k=6)
        answer = res.get('answer', '')
        # Remove any citation/source chunk info from the answer
        import re
        clean_answer = re.sub(r" ?as stated in \[SOURCE.*?\]| ?\[Source:.*?\]| ?chunk: [a-f0-9]+", "", answer, flags=re.IGNORECASE)
        return jsonify({'answer': clean_answer, 'error': res.get('error')})
    except Exception as e:
        logger.exception("Error in /api/query endpoint")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
# ------------------------------------------------

@app.route('/search')
def search():
    query = request.args.get('q', '').lower()
    results = []
    for section, items in knowledge_base.items():
        for item in items:
            item_str = json.dumps(item).lower()
            if query in item_str:
                item_with_type = item.copy()
                item_with_type['type'] = section
                results.append(item_with_type)
    return jsonify(results)

@app.route('/logout')
def logout():
    session.clear()
    logout_url = (
        f"https://login.microsoftonline.com/{app.config['AZURE_OAUTH_CLIENT_TENANT']}/oauth2/v2.0/logout"
        f"?post_logout_redirect_uri=https://localhost:5001"
    )
    return redirect(logout_url)

@app.route('/lms')
def lms():
    return render_template('lms.html')

@app.route('/studentserv')
def student_services():
    return render_template('studentserv.html')

@app.route('/attendance')
def attendance():
    return render_template('attendance.html')

@app.route('/instaConnect')
def insta_connect():
    return render_template('instaConnect.html')

# Faculty portal routes
@app.route('/faculty_portal/dashboard')
def faculty_portal_dashboard():
    if 'faculty_token' not in session:
        return redirect(url_for('root'))
    return render_template('faculty_portal/dashboard.html')

@app.route('/faculty_portal/profconnect')
def faculty_portal_profconnect():
    if 'faculty_token' not in session:
        return redirect(url_for('faculty_portal'))
    return render_template('faculty_portal/profconnect.html')

@app.route('/faculty_portal/attendance')
def faculty_portal_attendance():
    return render_template('faculty_portal/attendance.html')

@app.route('/faculty_portal/lms')
def faculty_portal_lms():
    return render_template('faculty_portal/lms.html')

@app.route('/faculty_portal/timetable')
def faculty_portal_timetable():
    return render_template('faculty_portal/timetable.html')

@app.route('/faculty_portal/notifications')
def faculty_portal_notifications():
    return render_template('faculty_portal/notifications.html')

@app.route('/faculty_portal/courses')
def faculty_portal_courses():
    if 'faculty_token' not in session:
        return redirect(url_for('root'))
    return render_template('faculty_portal/courses.html')

if __name__ == "__main__":
    from check_ollama import check_ollama_ready
    
    if not check_ollama_ready():
        logger.error("Ollama is not ready. Please ensure Ollama is installed and running with Llama 3.")
        sys.exit(1)
        
    app.run(debug=True, port=5001)