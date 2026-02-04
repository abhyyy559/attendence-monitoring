from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class Student(Base):
    __tablename__ = "students"
    
    student_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    roll_number = Column(String(50), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    batch_year = Column(Integer, nullable=False)
    enrollment_date = Column(Date, nullable=False)
    profile_picture_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="student_profile")
