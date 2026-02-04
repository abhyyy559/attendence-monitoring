from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import sys
from sqlalchemy import text
from app.routers import auth, courses, attendance, dashboard, faculty, student, reports, notifications
from app.database import engine, Base
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.course import Course, CourseEnrollment
from app.models.attendance import AttendanceRecord, AttendanceSummary, ShortageThreshold, ShortageReport
from app.models.notification import Notification
from app.models.user_settings import UserSettings

# Create tables
Base.metadata.create_all(bind=engine)

# Patch/normalize Postgres trigger functions (older DBs may have mismatched definitions)
try:
    if engine.url.get_backend_name() not in ["sqlite"]:
        with engine.begin() as conn:
            # Ensure the shortage notification trigger function matches our schema.
            conn.execute(text("""
CREATE OR REPLACE FUNCTION notify_shortage()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_course_name VARCHAR(255);
BEGIN
    SELECT u.user_id, c.course_name INTO v_user_id, v_course_name
    FROM course_enrollments ce
    JOIN students s ON ce.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN courses c ON ce.course_id = c.course_id
    WHERE ce.enrollment_id = NEW.enrollment_id;

    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        v_user_id,
        'Attendance Shortage Alert',
        FORMAT('Your attendance in %s is %.2f%%, which is below the required threshold.',
               v_course_name, NEW.attendance_percentage),
        'shortage_alert'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
            """))
except Exception as e:
    # Don't block app startup if DB doesn't support these objects (e.g. sqlite)
    print(f"WARNING: trigger patch skipped/failed: {e}")

app = FastAPI(title="Attendance Monitoring System")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: {exc}")
    traceback.print_exc()
    # Explicitly include CORS headers for browsers to see the error
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true"
        }
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)
app.include_router(faculty.router)
app.include_router(student.router)
app.include_router(reports.router)
app.include_router(notifications.router)

@app.get("/")
def read_root():
    return {"message": "Attendance Monitoring System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
