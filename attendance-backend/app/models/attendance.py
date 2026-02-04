from sqlalchemy import Column, String, Integer, Uuid, DateTime, ForeignKey, Date, Text, Boolean, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    
    attendance_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enrollment_id = Column(Uuid(as_uuid=True), ForeignKey('course_enrollments.enrollment_id', ondelete='CASCADE'))
    class_date = Column(Date, nullable=False)
    status = Column(String(10), nullable=False) # 'present', 'absent', 'late', 'excused'
    marked_by = Column(Uuid(as_uuid=True), ForeignKey('faculty.faculty_id'))
    marked_at = Column(DateTime(timezone=True), server_default=func.now())
    remarks = Column(Text)
    
    # Relationships
    enrollment = relationship("CourseEnrollment", backref="attendance_records")
    marker = relationship("Faculty")
    
    __table_args__ = (
        UniqueConstraint('enrollment_id', 'class_date', name='uq_enrollment_date'),
    )

class AttendanceSummary(Base):
    __tablename__ = "attendance_summary"
    
    summary_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enrollment_id = Column(Uuid(as_uuid=True), ForeignKey('course_enrollments.enrollment_id', ondelete='CASCADE'))
    total_classes = Column(Integer, default=0)
    classes_attended = Column(Integer, default=0)
    classes_absent = Column(Integer, default=0)
    classes_late = Column(Integer, default=0)
    classes_excused = Column(Integer, default=0)
    attendance_percentage = Column(Numeric(5, 2), default=0.00)
    shortage_status = Column(Boolean, default=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    enrollment = relationship("CourseEnrollment", uselist=False, backref="attendance_summary")
    
    __table_args__ = (
        UniqueConstraint('enrollment_id', name='uq_summary_enrollment'),
    )

class ShortageThreshold(Base):
    __tablename__ = "shortage_threshold"
    
    threshold_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department = Column(String(100))
    course_id = Column(Uuid(as_uuid=True), ForeignKey('courses.course_id'))
    minimum_percentage = Column(Numeric(5, 2), nullable=False, default=75.00)
    warning_percentage = Column(Numeric(5, 2), nullable=False, default=80.00)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    course = relationship("Course")
    
    __table_args__ = (
        UniqueConstraint('department', 'course_id', name='uq_dept_course_threshold'),
    )

class ShortageReport(Base):
    __tablename__ = "shortage_reports"
    
    report_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enrollment_id = Column(Uuid(as_uuid=True), ForeignKey('course_enrollments.enrollment_id'))
    report_date = Column(Date, nullable=False)
    attendance_percentage = Column(Numeric(5, 2))
    shortage_type = Column(String(20)) # 'critical', 'warning', 'normal'
    notification_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    enrollment = relationship("CourseEnrollment")
