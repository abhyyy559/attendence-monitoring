from app.database import engine, Base
# Import models to ensure they are registered with Base
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.course import Course, CourseEnrollment
from app.models.attendance import AttendanceRecord, AttendanceSummary, ShortageThreshold, ShortageReport
from app.models.notification import Notification
from app.config import get_settings

settings = get_settings()
db_url = settings.DATABASE_URL
masked_url = db_url.replace(db_url.split(":")[2].split("@")[0], "****") if ":" in db_url and "@" in db_url else db_url

print(f"Connecting to: {masked_url}")
print("Creating tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully on Supabase!")
except Exception as e:
    print(f"Error creating tables: {e}")
