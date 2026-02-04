from pydantic import BaseModel
from uuid import UUID

class NotificationCreate(BaseModel):
    course_id: UUID
    title: str
    message: str
