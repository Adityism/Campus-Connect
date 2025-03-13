import jwt
import datetime
from functools import wraps
from flask import request, jsonify

JWT_SECRET = "campus_connect_faculty_secret_key"  # Move to environment variables in production
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 24  # hours

def create_token(user_id, email, role="faculty"):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id,
        'email': email,
        'role': role
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['sub'] if payload['role'] == 'faculty' else None
    except:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
            
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(user_id=user_id, *args, **kwargs)
    return decorated
