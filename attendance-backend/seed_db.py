import os
import uuid
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.course import Course, CourseEnrollment
from app.models.attendance import AttendanceRecord, AttendanceSummary

def seed_data():
    # 1. Clear existing data to ensure a clean state
    # We do this in reverse order of dependencies
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Create Users
        # password123 hash
        password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5TQhUqRQvp7M."
        
        users_data = [
            {"email": "admin@college.edu", "role": "admin", "full_name": "Dr. Admin User", "phone": "9876543210"},
            {"email": "faculty@college.edu", "role": "faculty", "full_name": "Prof. Jane Smith", "phone": "9876543211"},
            {"email": "student@college.edu", "role": "student", "full_name": "John Doe", "phone": "9876543212"}
        ]
        
        db_users = {}
        for u_data in users_data:
            user = User(
                email=u_data["email"],
                password_hash=password_hash,
                role=u_data["role"],
                full_name=u_data["full_name"],
                phone=u_data["phone"]
            )
            db.add(user)
            db.flush() # Get ID
            db_users[u_data["email"]] = user

        # 2. Create Student & Faculty Details
        student = Student(
            user_id=db_users["student@college.edu"].user_id,
            roll_number="CS2024001",
            department="Computer Science",
            semester=6,
            batch_year=2021,
            enrollment_date=datetime.now().date()
        )
        db.add(student)
        db.flush()

        faculty = Faculty(
            user_id=db_users["faculty@college.edu"].user_id,
            employee_id="FAC001",
            department="Computer Science",
            designation="Professor"
        )
        db.add(faculty)
        db.flush()

        # 3. Create Courses
        courses_data = [
            {"code": "CS601", "name": "Data Structures"},
            {"code": "CS602", "name": "Operating Systems"},
            {"code": "CS603", "name": "Database Management"}
        ]
        
        db_courses = []
        for c_data in courses_data:
            course = Course(
                course_code=c_data["code"],
                course_name=c_data["name"],
                department="Computer Science",
                semester=6,
                credits=4,
                total_classes=40
            )
            db.add(course)
            db.flush()
            db_courses.append(course)

        # 4. Enroll Student in Courses
        enrollments = []
        for course in db_courses:
            enrollment = CourseEnrollment(
                student_id=student.student_id,
                course_id=course.course_id,
                faculty_id=faculty.faculty_id,
                academic_year="2024-2025"
            )
            db.add(enrollment)
            db.flush()
            enrollments.append(enrollment)

        # 5. Generate Attendance (Last 15 days)
        for enrollment in enrollments:
            attended = 0
            for i in range(1, 16):
                class_date = datetime.now().date() - timedelta(days=i)
                status = "present" if random.random() > 0.3 else "absent"
                if status == "present":
                    attended += 1
                
                record = AttendanceRecord(
                    enrollment_id=enrollment.enrollment_id,
                    class_date=class_date,
                    status=status,
                    marked_by=faculty.faculty_id
                )
                db.add(record)
            
            # Create Summary
            summary = AttendanceSummary(
                enrollment_id=enrollment.enrollment_id,
                total_classes=15,
                classes_attended=attended,
                classes_absent=15 - attended,
                attendance_percentage=round((attended / 15) * 100, 2),
                shortage_status=(attended / 15) < 0.75
            )
            db.add(summary)
            
        db.commit()
        print("Database wiped and seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
