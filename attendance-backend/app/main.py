from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, courses, attendance, dashboard, faculty, student, reports
from app.database import engine, Base
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.course import Course, CourseEnrollment
from app.models.attendance import AttendanceRecord, AttendanceSummary, ShortageThreshold, ShortageReport
from app.models.notification import Notification

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Attendance Monitoring System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
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

@app.get("/")
def read_root():
    return {"message": "Attendance Monitoring System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
