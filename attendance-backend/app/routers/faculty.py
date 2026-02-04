from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.attendance import BulkAttendanceCreate
from app.utils.security import get_current_user
from app.services.attendance_service import attendance_service

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])

@router.post("/attendance/mark", status_code=status.HTTP_200_OK)
def mark_attendance(
    data: BulkAttendanceCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint for faculty to mark attendance.
    Expects JSON: {"course_id": "...", "class_date": "...", "attendance_data": [...]}
    """
    if current_user.role != "faculty" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Faculty only.")

    result = attendance_service.mark_attendance(
        db=db,
        course_id=data.course_id,
        class_date=data.class_date,
        attendance_data=data.attendance_data,
        marked_by=current_user.user_id
    )
    return result
