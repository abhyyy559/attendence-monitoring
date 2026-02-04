from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class CourseBase(BaseModel):
    course_code: str
    course_name: str
    department: str
    semester: int
    credits: int
    room_number: Optional[str] = None
    syllabus_link: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    credits: Optional[int] = None
    room_number: Optional[str] = None
    syllabus_link: Optional[str] = None

class CourseResponse(CourseBase):
    course_id: UUID
    total_classes: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class EnrollmentBase(BaseModel):
    student_id: UUID
    course_id: UUID
    faculty_id: Optional[UUID] = None
    academic_year: str

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentResponse(EnrollmentBase):
    enrollment_id: UUID
    enrollment_date: datetime
    
    class Config:
        from_attributes = True

class EnrollmentByRollNumber(BaseModel):
    roll_number: str
    course_id: UUID
    academic_year: Optional[str] = "2023-2024"
