from sqlalchemy import Column, String, Uuid, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Faculty(Base):
    __tablename__ = "faculty"
    
    faculty_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    employee_id = Column(String(50), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    designation = Column(String(100))
    specialization = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="faculty_profile")
