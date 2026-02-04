from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.utils.security import get_current_user
from app.models.student import Student
from app.models.course import CourseEnrollment
from uuid import UUID
from app.schemas.notification import NotificationCreate

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/")
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.user_id
    ).order_by(Notification.created_at.desc()).all()
    
    return [
        {
            "notification_id": str(n.notification_id),
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at
        } for n in notifications
    ]

@router.put("/read-all")
def mark_all_as_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.user_id == current_user.user_id,
        Notification.is_read == False
    ).update({Notification.is_read: True}, synchronize_session=False)
    
    db.commit()
    return {"message": "All notifications marked as read"}

@router.post("/send")
def send_reminder(data: NotificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty only")
    
    # Find all students in this course
    students = db.query(Student).join(CourseEnrollment, Student.student_id == CourseEnrollment.student_id).filter(CourseEnrollment.course_id == data.course_id).all()
    
    new_notifications = []
    for s in students:
        new_notifications.append(Notification(
            user_id=s.user_id,
            title=data.title,
            message=data.message,
            type="info"
        ))
    
    db.add_all(new_notifications)
    db.commit()
    return {"message": f"Reminders sent to {len(new_notifications)} students"}
