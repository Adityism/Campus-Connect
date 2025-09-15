from .routes import faculty_bp
from .auth import create_token, verify_token, token_required
from .models import (
    get_faculty_by_email,
    get_student_queries,
    save_query_response,
    get_faculty_courses,
    get_attendance_records,
    save_attendance_record,
    get_course_materials,
    save_course_material,
    get_faculty_timetable,
    get_faculty_notifications,
    save_notification
)
