import os
import json
import uuid
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

FACULTY_FILE = os.path.join(DATA_DIR, 'faculty.json')
QUERIES_FILE = os.path.join(DATA_DIR, 'queries.json')
COURSES_FILE = os.path.join(DATA_DIR, 'courses.json')
ATTENDANCE_FILE = os.path.join(DATA_DIR, 'attendance.json')
MATERIALS_FILE = os.path.join(DATA_DIR, 'materials.json')
TIMETABLE_FILE = os.path.join(DATA_DIR, 'timetable.json')
NOTIFICATIONS_FILE = os.path.join(DATA_DIR, 'notifications.json')

def load_data(file_path):
    if not os.path.exists(file_path):
        data = [] if file_path.endswith(('faculty.json', 'queries.json', 'notifications.json')) else {}
        save_data(file_path, data)
        return data
    with open(file_path, 'r') as f:
        return json.load(f)

def save_data(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def get_faculty_by_email(email):
    """Get faculty by email"""
    faculty_data = load_data(FACULTY_FILE)
    return next((f for f in faculty_data if f['email'] == email), None)

def get_student_queries(faculty_id, status='pending'):
    """Get queries assigned to faculty"""
    queries = load_data(QUERIES_FILE)
    return [q for q in queries if q['assigned_to'] == faculty_id and q['status'] == status]

def save_query_response(query_id, faculty_id, response):
    """Save faculty response to query"""
    queries = load_data(QUERIES_FILE)
    for query in queries:
        if query['id'] == query_id and query['assigned_to'] == faculty_id:
            query['response'] = response
            query['status'] = 'answered'
            query['answered_at'] = datetime.now().isoformat()
            save_data(QUERIES_FILE, queries)
            return True
    return False

def get_faculty_courses(faculty_id):
    """Get courses taught by faculty"""
    courses = load_data(COURSES_FILE)
    return [
        {**course, 'id': course_id}
        for course_id, course in courses.items()
        if course.get('faculty_id') == faculty_id
    ]

def get_attendance_records(faculty_id, course_id, date=None):
    """Get attendance records for a course"""
    attendance = load_data(ATTENDANCE_FILE)
    course_attendance = attendance.get(course_id, {})
    
    if date:
        return course_attendance.get(date, [])
    return course_attendance

def save_attendance_record(faculty_id, course_id, date, records):
    """Save attendance records for a course"""
    attendance = load_data(ATTENDANCE_FILE)
    if course_id not in attendance:
        attendance[course_id] = {}
    attendance[course_id][date] = records
    save_data(ATTENDANCE_FILE, attendance)
    return True

def get_course_materials(course_id):
    """Get course materials"""
    materials = load_data(MATERIALS_FILE)
    return materials.get(course_id, [])

def save_course_material(faculty_id, course_id, title, description, material_type, content):
    """Save course material"""
    materials = load_data(MATERIALS_FILE)
    if course_id not in materials:
        materials[course_id] = []
    
    material = {
        'id': str(uuid.uuid4()),
        'title': title,
        'description': description,
        'type': material_type,
        'content': content,
        'faculty_id': faculty_id,
        'created_at': datetime.now().isoformat()
    }
    
    materials[course_id].append(material)
    save_data(MATERIALS_FILE, materials)
    return material['id']

def get_faculty_timetable(faculty_id):
    """Get faculty timetable"""
    timetables = load_data(TIMETABLE_FILE)
    return timetables.get(faculty_id, {
        'monday': [], 'tuesday': [], 'wednesday': [],
        'thursday': [], 'friday': [], 'saturday': [], 'sunday': []
    })

def get_faculty_notifications(faculty_id):
    """Get notifications sent by faculty"""
    notifications = load_data(NOTIFICATIONS_FILE)
    return [n for n in notifications if n['faculty_id'] == faculty_id]

def save_notification(faculty_id, title, message, recipients='all', course_id=None):
    """Save a new notification"""
    notifications = load_data(NOTIFICATIONS_FILE)
    
    notification = {
        'id': str(uuid.uuid4()),
        'faculty_id': faculty_id,
        'title': title,
        'message': message,
        'recipients': recipients,
        'course_id': course_id,
        'created_at': datetime.now().isoformat()
    }
    
    notifications.append(notification)
    save_data(NOTIFICATIONS_FILE, notifications)
    return notification['id']

def ensure_default_faculty():
    """Create default faculty account if none exists"""
    faculty_data = load_data(FACULTY_FILE)
    
    if not faculty_data:
        default_faculty = {
            'id': str(uuid.uuid4()),
            'name': 'Demo Faculty',
            'email': 'faculty@upes.ac.in',
            'password_hash': 'demo123',  # In production, use proper password hashing
            'department': 'Computer Science',
            'created_at': datetime.now().isoformat()
        }
        faculty_data.append(default_faculty)
        save_data(FACULTY_FILE, faculty_data)
        print(f"Created default faculty account: {default_faculty['email']}")
    return faculty_data

# Call this when module loads
ensure_default_faculty()
