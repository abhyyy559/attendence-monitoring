from sqlalchemy import Column, String, Integer, Uuid, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Course(Base):
    __tablename__ = "courses"
    
    course_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_code = Column(String(20), unique=True, nullable=False)
    course_name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    credits = Column(Integer, nullable=False)
    total_classes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    
    enrollment_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(Uuid(as_uuid=True), ForeignKey('students.student_id', ondelete='CASCADE'))
    course_id = Column(Uuid(as_uuid=True), ForeignKey('courses.course_id', ondelete='CASCADE'))
    faculty_id = Column(Uuid(as_uuid=True), ForeignKey('faculty.faculty_id'))
    academic_year = Column(String(10), nullable=False)
    enrollment_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    student = relationship("Student", backref="enrollments")
    course = relationship("Course", backref="enrollments")
    faculty = relationship("Faculty", backref="course_assignments")
    
    __table_args__ = (
        UniqueConstraint('student_id', 'course_id', 'academic_year', name='uq_student_course_year'),
    )
