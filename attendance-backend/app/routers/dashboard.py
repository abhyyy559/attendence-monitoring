from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
import datetime
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.course import Course, CourseEnrollment
from app.models.attendance import AttendanceSummary, AttendanceRecord
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/student")
def get_student_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not a student")
    
    student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
    if not student:
        # Return empty dashboard if profile doesn't exist yet
        return {
            "overall_percentage": 0,
            "courses": [],
            "student_info": {
                "roll_number": "Not Set",
                "department": "Not Set",
                "semester": 0
            }
        }
        
    summaries = db.query(AttendanceSummary, Course).join(
        CourseEnrollment, AttendanceSummary.enrollment_id == CourseEnrollment.enrollment_id
    ).join(
        Course, CourseEnrollment.course_id == Course.course_id
    ).filter(CourseEnrollment.student_id == student.student_id).all()
    
    # Format response
    courses_data = []
    overall_total = 0
    overall_attended = 0
    
    for summary, course in summaries:
        courses_data.append({
            "course_name": course.course_name,
            "course_code": course.course_code,
            "percentage": float(summary.attendance_percentage),
            "shortage": summary.shortage_status,
            "total_classes": summary.total_classes,
            "attended": summary.classes_attended + summary.classes_late
        })
        overall_total += summary.total_classes
        overall_attended += (summary.classes_attended + summary.classes_late)
        
    overall_percentage = (overall_attended / overall_total * 100) if overall_total > 0 else 0
    
    return {
        "overall_percentage": round(overall_percentage, 2),
        "courses": courses_data,
        "student_info": {
            "roll_number": student.roll_number,
            "department": student.department,
            "semester": student.semester
        }
    }

@router.get("/faculty")
def get_faculty_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "faculty":
        raise HTTPException(status_code=403, detail="Not a faculty member")
        
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.user_id).first()
    if not faculty:
        # Return empty dashboard if profile doesn't exist yet
        return {
            "faculty_info": {
                "employee_id": "Not Set",
                "department": "Not Set"
            },
            "courses": []
        }
        
    # Get courses assigned to this faculty with performance
    courses_query = db.query(
        Course, 
        func.count(CourseEnrollment.enrollment_id).label("student_count"),
        func.avg(AttendanceSummary.attendance_percentage).label("avg_attendance")
    ).join(
        CourseEnrollment, Course.course_id == CourseEnrollment.course_id
    ).join(
        AttendanceSummary, CourseEnrollment.enrollment_id == AttendanceSummary.enrollment_id
    ).filter(CourseEnrollment.faculty_id == faculty.faculty_id).group_by(Course.course_id).all()
    
    courses_data = []
    for course, count, avg_att in courses_query:
        courses_data.append({
            "course_id": str(course.course_id),
            "course_name": course.course_name,
            "course_code": course.course_code,
            "student_count": count,
            "avg_attendance": round(float(avg_att or 0), 1)
        })
    
    # Daily activity trend (last 7 days)
    today = datetime.date.today()
    activity_trend = []
    for i in range(6, -1, -1):
        target_date = today - datetime.timedelta(days=i)
        
        counts = db.query(
            func.count(AttendanceRecord.attendance_id).label("total"),
            func.sum(case((AttendanceRecord.status == "present", 1), (AttendanceRecord.status == "late", 1), else_=0)).label("present"),
            func.sum(case((AttendanceRecord.status == "absent", 1), else_=0)).label("absent")
        ).filter(
            AttendanceRecord.marked_by == faculty.faculty_id,
            AttendanceRecord.class_date == target_date
        ).first()
        
        activity_trend.append({
            "date": target_date.strftime("%b %d"),
            "present": int(counts.present or 0),
            "absent": int(counts.absent or 0)
        })
        
    return {
        "faculty_info": {
            "employee_id": faculty.employee_id,
            "department": faculty.department
        },
        "courses": courses_data,
        "stats": {
            "total_students": sum(c['student_count'] for c in courses_data),
            "avg_attendance": round(sum(c['avg_attendance'] for c in courses_data) / len(courses_data), 1) if courses_data else 0,
            "total_courses": len(courses_data)
        },
        "daily_activity": activity_trend
    }

@router.get("/admin")
def get_admin_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not an admin")
        
    total_students = db.query(func.count(Student.student_id)).scalar()
    total_faculty = db.query(func.count(Faculty.faculty_id)).scalar()
    total_courses = db.query(func.count(Course.course_id)).scalar()
    shortage_count = db.query(func.count(AttendanceSummary.summary_id)).filter(AttendanceSummary.shortage_status == True).scalar()
    
    return {
        "stats": {
            "total_students": total_students or 0,
            "total_faculty": total_faculty or 0,
            "total_courses": total_courses or 0,
            "shortage_alerts": shortage_count or 0
        },
        "dept_distribution": [
            {"name": dept, "value": count} for dept, count in db.query(Student.department, func.count(Student.student_id)).group_by(Student.department).all()
        ],
        "course_performance": [
            {
                "name": code, 
                "present": round(float(avg_perc), 1), 
                "absent": round(100 - float(avg_perc), 1)
            } for code, avg_perc in db.query(Course.course_code, func.avg(AttendanceSummary.attendance_percentage))\
                .join(CourseEnrollment, Course.course_id == CourseEnrollment.course_id)\
                .join(AttendanceSummary, CourseEnrollment.enrollment_id == AttendanceSummary.enrollment_id)\
                .group_by(Course.course_code).all()
        ]
    }
