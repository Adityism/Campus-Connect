from flask import Blueprint, request, jsonify, session
from .auth import verify_token, create_token, token_required
from .models import (
    get_faculty_by_email,
    get_student_queries,
    save_query_response,
    get_attendance_records,
    save_attendance_record,
    get_faculty_courses,
    get_course_materials,
    save_course_material,
    get_faculty_timetable,
    save_notification,
    get_faculty_notifications
)
import os
import sys

faculty_bp = Blueprint('faculty', __name__)

@faculty_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    faculty = get_faculty_by_email(email)
    if not faculty:
        return jsonify({"error": "Faculty not found"}), 404
    
    if faculty['password_hash'] != password:  # In production, use proper hashing
        return jsonify({"error": "Invalid credentials"}), 401
    
    token = create_token(faculty['id'], email, 'faculty')
    session['faculty_token'] = token
    
    return jsonify({
        "token": token,
        "faculty": {
            "id": faculty['id'],
            "name": faculty['name'],
            "email": faculty['email'],
            "department": faculty['department']
        }
    })

# Add other routes from the prompt...
