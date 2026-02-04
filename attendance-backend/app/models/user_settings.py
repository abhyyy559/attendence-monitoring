from sqlalchemy import Column, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.sql import func
import uuid

from app.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    settings_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)

    notifications_enabled = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

