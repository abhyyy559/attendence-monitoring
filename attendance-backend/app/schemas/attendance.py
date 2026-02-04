from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class AttendanceMark(BaseModel):
    student_id: UUID
    status: str # present, absent, late, excused
    remarks: Optional[str] = None

class BulkAttendanceCreate(BaseModel):
    course_id: UUID
    class_date: date
    attendance_data: List[AttendanceMark]

class AttendanceRecordResponse(BaseModel):
    attendance_id: UUID
    enrollment_id: UUID
    class_date: date
    status: str
    marked_by: Optional[UUID]
    marked_at: datetime
    remarks: Optional[str]

    class Config:
        from_attributes = True

class AttendanceSummaryResponse(BaseModel):
    summary_id: UUID
    enrollment_id: UUID
    total_classes: int
    classes_attended: int
    classes_absent: int
    classes_late: int
    classes_excused: int
    attendance_percentage: float
    shortage_status: bool
    last_updated: datetime

    class Config:
        from_attributes = True
