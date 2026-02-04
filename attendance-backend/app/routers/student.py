from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, case
from sqlalchemy.orm import Session
import datetime
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.course import Course, CourseEnrollment
from app.models.attendance import AttendanceRecord, AttendanceSummary
from app.models.faculty import Faculty
from app.utils.security import get_current_user
from sqlalchemy.orm import aliased

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("")
def list_students(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    List all students for faculty/admin so they can enroll them into courses.
    """
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    students = db.query(Student, User.full_name, User.email).join(User, Student.user_id == User.user_id).all()
    return [
        {
            "student_id": str(s.Student.student_id),
            "user_id": str(s.Student.user_id),
            "roll_number": s.Student.roll_number,
            "full_name": s.full_name,
            "email": s.email,
            "department": s.Student.department,
            "semester": s.Student.semester,
        }
        for s in students
    ]

@router.get("/dashboard")
def get_student_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns real attendance data (percentage, shortage status) from the summary table.
    """
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not a student")
    
    student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
    if not student:
        return {
            "overall_percentage": 0,
            "courses": [],
            "student_info": {"roll_number": "N/A", "department": "N/A", "semester": 0}
        }
        
    # Query attendance_summary + enrollment (to surface academic_year)
    summaries = db.query(AttendanceSummary, Course, CourseEnrollment).join(
        CourseEnrollment, AttendanceSummary.enrollment_id == CourseEnrollment.enrollment_id
    ).join(
        Course, CourseEnrollment.course_id == Course.course_id
    ).filter(CourseEnrollment.student_id == student.student_id).all()
    
    courses_data = []
    total_weighted_percentage = 0
    
    academic_years = set()

    for summary, course, enrollment in summaries:
        if enrollment.academic_year:
            academic_years.add(enrollment.academic_year)
        courses_data.append({
            "course_name": course.course_name,
            "course_code": course.course_code,
            "percentage": float(summary.attendance_percentage),
            "shortage": summary.shortage_status,
            "total_classes": summary.total_classes,
            "attended": summary.classes_attended + summary.classes_late,
            "academic_year": enrollment.academic_year,
        })
        total_weighted_percentage += summary.attendance_percentage
        
    overall_percentage = (total_weighted_percentage / len(summaries)) if summaries else 0
    
    # Prefer a real academic year if present; otherwise compute a sensible default
    now_year = datetime.date.today().year
    default_academic_year = f"{now_year}-{now_year + 1}"

    return {
        "overall_percentage": round(overall_percentage, 2),
        "courses": courses_data,
        "student_info": {
            "full_name": current_user.full_name,
            "roll_number": student.roll_number,
            "department": student.department,
            "semester": student.semester
        },
        "academic_year": next(iter(sorted(academic_years)), default_academic_year),
        "student_id": student.student_id
    }

@router.get("/attendance")
def get_student_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not a student")
    
    student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
    if not student:
        return []
        
    FacultyUser = aliased(User)
    
    records = db.query(
        AttendanceRecord, 
        Course.course_name, 
        FacultyUser.full_name.label("faculty_name")
    ).join(
        CourseEnrollment, AttendanceRecord.enrollment_id == CourseEnrollment.enrollment_id
    ).join(
        Course, CourseEnrollment.course_id == Course.course_id
    ).join(
        Faculty, CourseEnrollment.faculty_id == Faculty.faculty_id
    ).join(
        FacultyUser, Faculty.user_id == FacultyUser.user_id
    ).filter(
        CourseEnrollment.student_id == student.student_id
    ).order_by(AttendanceRecord.class_date.desc()).all()
    
    attendance_list = []
    for r in records:
        attendance_list.append({
            "id": r[0].attendance_id,
            "date": r[0].class_date.isoformat(),
            "course": r[1],
            "status": r[0].status,
            "faculty": r[2]
        })
    
    return attendance_list

@router.get("/trends")
def get_attendance_trends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not a student")
    
    student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
    if not student:
        return []
    
    enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.student_id == student.student_id).all()
    enrollment_ids = [e.enrollment_id for e in enrollments]
    
    trends = []
    today = datetime.date.today()
    for i in range(29, -1, -1):
        target_date = today - datetime.timedelta(days=i)
        
        counts = db.query(
            func.count(AttendanceRecord.attendance_id).label("total"),
            func.sum(case((AttendanceRecord.status == "present", 1), else_=0)).label("present"),
            func.sum(case((AttendanceRecord.status == "late", 1), else_=0)).label("late")
        ).filter(
            AttendanceRecord.enrollment_id.in_(enrollment_ids),
            AttendanceRecord.class_date == target_date
        ).first()
        
        total = counts.total or 0
        present = (counts.present or 0) + (counts.late or 0)
        percentage = round((present / total * 100), 1) if total > 0 else 0
        
        trends.append({
            "name": target_date.strftime("%b %d"),
            "attendance": percentage,
            "fullDate": target_date.isoformat()
        })
        
    return trends
