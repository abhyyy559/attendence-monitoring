from fastapi import APIRouter, Depends, HTTPException, status
from datetime import date
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.attendance import BulkAttendanceCreate
from app.utils.security import get_current_user
from app.services.attendance_service import attendance_service
from app.models.course import Course, CourseEnrollment
from app.models.student import Student
from app.models.faculty import Faculty
from app.schemas.course import CourseCreate, EnrollmentByRollNumber, CourseUpdate
from app.models.attendance import AttendanceSummary, AttendanceRecord
from pydantic import BaseModel

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])


class EnrollStudentRequest(BaseModel):
    student_id: str
    academic_year: str | None = None

@router.post("/attendance/mark", status_code=status.HTTP_200_OK)
def mark_attendance(
    data: BulkAttendanceCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized. Faculty only.")

    # Resolve faculty_id
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.user_id).first()
    faculty_id = faculty.faculty_id if faculty else None

    result = attendance_service.mark_attendance(
        db=db,
        course_id=data.course_id,
        class_date=data.class_date,
        attendance_data=data.attendance_data,
        marked_by=faculty_id
    )
    return result

@router.post("/courses", status_code=status.HTTP_201_CREATED)
def create_course(data: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    # Resolve faculty_id for the course
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.user_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    
    # Create course with faculty_id (we'll link it via enrollments, but store department from faculty)
    course_data = data.model_dump()
    # Ensure department matches faculty department if not provided
    if not course_data.get('department') or course_data.get('department') == '':
        course_data['department'] = faculty.department
    
    db_course = Course(**course_data)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    # Return proper response with course data
    return {
        "message": "Course created successfully",
        "course": {
            "course_id": str(db_course.course_id),
            "course_code": db_course.course_code,
            "course_name": db_course.course_name,
            "department": db_course.department,
            "semester": db_course.semester,
            "credits": db_course.credits,
            "room_number": db_course.room_number,
            "syllabus_link": db_course.syllabus_link,
            "total_classes": db_course.total_classes,
            "created_at": db_course.created_at.isoformat() if db_course.created_at else None
        }
    }

@router.get("/courses")
def get_faculty_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.user_id).first()
    if not faculty:
        return []
    
    # Return courses where this faculty is assigned in any enrollment OR courses in the same department
    # This ensures newly created courses appear immediately
    
    # Courses where faculty has enrollments
    courses_with_enrollments = db.query(Course.course_id).join(CourseEnrollment).filter(
        CourseEnrollment.faculty_id == faculty.faculty_id
    ).distinct().subquery()
    
    # Get all courses: those with enrollments OR those in the same department
    courses = db.query(Course).filter(
        or_(
            Course.course_id.in_(db.query(courses_with_enrollments.c.course_id)),
            Course.department == faculty.department
        )
    ).distinct().all()
    
    # Format response
    return [
        {
            "course_id": str(c.course_id),
            "course_code": c.course_code,
            "course_name": c.course_name,
            "department": c.department,
            "semester": c.semester,
            "credits": c.credits,
            "room_number": c.room_number,
            "syllabus_link": c.syllabus_link,
            "total_classes": c.total_classes,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in courses
    ]

@router.put("/courses/{course_id}")
def update_course(course_id: str, data: CourseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)
    
    db.commit()
    db.refresh(course)
    return course

@router.post("/courses/{course_id}/quick-mark")
def quick_mark_attendance(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Marks all enrolled students as Present for today."""
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course_id).all()
    if not enrollments:
        raise HTTPException(status_code=404, detail="No students enrolled in this course")
    
    today = date.today()
    
    # Check if already marked for today (any record for this course today)
    # We join with CourseEnrollment to filter by course_id
    existing = db.query(AttendanceRecord).join(
        CourseEnrollment, AttendanceRecord.enrollment_id == CourseEnrollment.enrollment_id
    ).filter(
        CourseEnrollment.course_id == course_id,
        AttendanceRecord.class_date == today
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for this course today")
    
    attendance_data = []
    for e in enrollments:
        attendance_data.append({
            "student_id": str(e.student_id),
            "status": "present"
        })
    
    # Resolve faculty_id
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.user_id).first()
    faculty_id = faculty.faculty_id if faculty else None

    result = attendance_service.mark_attendance(
        db=db,
        course_id=course_id,
        class_date=today,
        attendance_data=attendance_data,
        marked_by=faculty_id
    )
    return result

@router.post("/courses/enroll", status_code=status.HTTP_201_CREATED)
def enroll_student(data: EnrollmentByRollNumber, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    # Resolve student by roll number
    student = db.query(Student).filter(Student.roll_number == data.roll_number).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with roll number {data.roll_number} not found")
    
    # Resolve faculty_id if current user is faculty
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.user_id).first()
    faculty_id = faculty.faculty_id if faculty else None

    # Check existing
    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.student_id == student.student_id,
        CourseEnrollment.course_id == data.course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled")

    new_enrollment = CourseEnrollment(
        student_id=student.student_id,
        course_id=data.course_id,
        faculty_id=faculty_id,
        academic_year=data.academic_year
    )
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    # Initialize summary
    summary = AttendanceSummary(enrollment_id=new_enrollment.enrollment_id)
    db.add(summary)
    db.commit()

    return {"message": "Enrollment successful", "student": student.roll_number}


@router.post("/courses/{course_id}/enroll", status_code=status.HTTP_201_CREATED)
def enroll_student_by_id(
    course_id: str,
    payload: EnrollStudentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Faculty-driven enrollment bridge: link a student to a course explicitly.
    Body: { "student_id": "uuid", "academic_year": "YYYY-YYYY" (optional) }
    """
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")

    # Resolve faculty_id
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.user_id).first()
    faculty_id = faculty.faculty_id if faculty else None
    if not faculty_id:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    # Validate student exists
    student = db.query(Student).filter(Student.student_id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Validate course exists
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Compute academic year if not provided
    now_year = date.today().year
    academic_year = payload.academic_year or f"{now_year}-{now_year + 1}"

    # Prevent duplicates
    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.student_id == student.student_id,
        CourseEnrollment.course_id == course.course_id,
        CourseEnrollment.academic_year == academic_year
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this course for the academic year")

    new_enrollment = CourseEnrollment(
        student_id=student.student_id,
        course_id=course.course_id,
        faculty_id=faculty_id,
        academic_year=academic_year
    )
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    # Initialize summary row
    summary = AttendanceSummary(enrollment_id=new_enrollment.enrollment_id)
    db.add(summary)
    db.commit()

    return {
        "message": "Student enrolled",
        "enrollment": {
            "enrollment_id": str(new_enrollment.enrollment_id),
            "student_id": str(new_enrollment.student_id),
            "course_id": str(new_enrollment.course_id),
            "faculty_id": str(new_enrollment.faculty_id) if new_enrollment.faculty_id else None,
            "academic_year": new_enrollment.academic_year,
        }
    }

@router.get("/students")
def get_all_students(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    students = db.query(Student, User.full_name).join(User, Student.user_id == User.user_id).all()
    return [{"student_id": s.Student.student_id, "roll_number": s.Student.roll_number, "full_name": s.full_name, "department": s.Student.department} for s in students]

@router.delete("/courses/{course_id}")
def delete_course(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(course)
    db.commit()
    return {"message": "Course deleted"}

@router.delete("/courses/{course_id}/unenroll/{student_id}")
def unenroll_student(course_id: str, student_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.student_id == student_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    db.delete(enrollment)
    db.commit()
    return {"message": "Student unenrolled"}

@router.get("/history")
def get_marking_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    # Resolve faculty_id
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.user_id).first()
    faculty_id = faculty.faculty_id if faculty else None

    # Get unique sessions marked by this faculty/admin
    sessions = db.query(
        AttendanceRecord.class_date,
        Course.course_name,
        Course.course_code,
        Course.course_id,
        func.count(AttendanceRecord.attendance_id).label("total_marked")
    ).join(CourseEnrollment, AttendanceRecord.enrollment_id == CourseEnrollment.enrollment_id)\
     .join(Course, CourseEnrollment.course_id == Course.course_id)\
     .filter(AttendanceRecord.marked_by == faculty_id)\
     .group_by(AttendanceRecord.class_date, Course.course_id)\
     .order_by(AttendanceRecord.class_date.desc()).all()
    
    return [
        {
            "date": s[0].isoformat(),
            "course_name": s[1],
            "course_code": s[2],
            "course_id": s[3],
            "marked_count": s[4]
        } for s in sessions
    ]
