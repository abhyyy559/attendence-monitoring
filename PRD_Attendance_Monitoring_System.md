# Product Requirements Document (PRD)
## Attendance Monitoring System

---

### Document Information

**Project Name:** Attendance Monitoring System  
**Version:** 1.0  
**Date:** February 3, 2026  
**Prepared For:** M.Tech Academic Project  
**Document Owner:** Student Name  
**Status:** Draft for Development

---

## 1. Executive Summary

### 1.1 Project Overview
The Attendance Monitoring System is a comprehensive web-based application designed to automate the tracking of student attendance and generate intelligent shortage reports. The system leverages database records, triggers, and cursors to ensure data integrity and provide real-time insights into attendance patterns.

### 1.2 Business Objectives
- Automate attendance tracking to eliminate manual errors
- Provide real-time attendance status to students and faculty
- Generate automated shortage reports based on institutional policies
- Maintain historical attendance records for analysis
- Ensure data integrity through database-level constraints and triggers

### 1.3 Target Users
- Students: View personal attendance records and shortage alerts
- Faculty: Mark attendance and view class-wise reports
- Administrators: Manage system configurations, generate comprehensive reports
- Department Heads: Monitor department-wide attendance trends

---

## 2. Technical Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework:** React 18+
- **UI Libraries:** 
  - React Router DOM (routing)
  - Axios (HTTP client)
  - Recharts/Chart.js (data visualization)
  - TailwindCSS (styling)
  - React Hook Form (form management)
  - React Toastify (notifications)
- **Build Tool:** Vite or Create React App
- **State Management:** React Context API / Redux Toolkit (if needed)

#### Backend
- **Framework:** FastAPI (Python 3.9+)
- **ASGI Server:** Uvicorn
- **Additional Python Libraries:**
  - Pydantic (data validation)
  - python-jose (JWT authentication)
  - passlib[bcrypt] (password hashing)
  - python-multipart (file uploads)
  - email-validator
  - pytz (timezone handling)

#### Database
- **Primary Database:** Supabase (PostgreSQL-based)
- **ORM:** SQLAlchemy or Raw SQL with psycopg2
- **Database Features Used:**
  - Stored Procedures
  - Triggers (for automatic calculations)
  - Cursors (for batch processing)
  - Functions (for complex calculations)
  - Views (for reporting)

#### Additional Tools & Services
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Supabase Storage (for profile pictures, documents)
- **Email Service:** SendGrid/SMTP (for notifications)
- **PDF Generation:** ReportLab or WeasyPrint (Python)
- **Excel Export:** openpyxl or xlsxwriter (Python)

### 2.2 System Architecture

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND                       │
│              (React + HTML/CSS)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Student  │  │ Faculty  │  │  Admin   │     │
│  │Dashboard │  │Dashboard │  │Dashboard │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└────────────────────┬────────────────────────────┘
                     │ HTTP/HTTPS
                     │ REST API
┌────────────────────▼────────────────────────────┐
│              BACKEND (FastAPI)                  │
│  ┌──────────────────────────────────────────┐  │
│  │         API Layer (Uvicorn)              │  │
│  ├──────────────────────────────────────────┤  │
│  │    Authentication & Authorization        │  │
│  ├──────────────────────────────────────────┤  │
│  │      Business Logic Layer                │  │
│  │  • Attendance Management                 │  │
│  │  • Report Generation                     │  │
│  │  • User Management                       │  │
│  │  • Notification Service                  │  │
│  └──────────────────┬───────────────────────┘  │
└────────────────────┬┴───────────────────────────┘
                     │
                     │ SQL Queries
                     │
┌────────────────────▼────────────────────────────┐
│          DATABASE (Supabase/PostgreSQL)         │
│  ┌──────────────────────────────────────────┐  │
│  │  Tables: users, students, courses,       │  │
│  │  attendance, attendance_summary          │  │
│  ├──────────────────────────────────────────┤  │
│  │  Triggers: auto_calculate_percentage,    │  │
│  │  check_shortage, update_summary          │  │
│  ├──────────────────────────────────────────┤  │
│  │  Stored Procedures: generate_reports,    │  │
│  │  bulk_attendance_update                  │  │
│  ├──────────────────────────────────────────┤  │
│  │  Views: shortage_view, attendance_stats  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 3. Database Design

### 3.1 Core Tables

#### 3.1.1 users
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.2 students
```sql
CREATE TABLE students (
    student_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    batch_year INTEGER NOT NULL,
    enrollment_date DATE NOT NULL,
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.3 faculty
```sql
CREATE TABLE faculty (
    faculty_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    specialization TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.4 courses
```sql
CREATE TABLE courses (
    course_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER NOT NULL,
    total_classes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.5 course_enrollments
```sql
CREATE TABLE course_enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(faculty_id),
    academic_year VARCHAR(10) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, academic_year)
);
```

#### 3.1.6 attendance_records
```sql
CREATE TABLE attendance_records (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(enrollment_id) ON DELETE CASCADE,
    class_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID REFERENCES faculty(faculty_id),
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    UNIQUE(enrollment_id, class_date)
);
```

#### 3.1.7 attendance_summary (Materialized View/Table)
```sql
CREATE TABLE attendance_summary (
    summary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(enrollment_id) ON DELETE CASCADE,
    total_classes INTEGER DEFAULT 0,
    classes_attended INTEGER DEFAULT 0,
    classes_absent INTEGER DEFAULT 0,
    classes_late INTEGER DEFAULT 0,
    classes_excused INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    shortage_status BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id)
);
```

#### 3.1.8 shortage_threshold
```sql
CREATE TABLE shortage_threshold (
    threshold_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department VARCHAR(100),
    course_id UUID REFERENCES courses(course_id),
    minimum_percentage DECIMAL(5,2) NOT NULL DEFAULT 75.00,
    warning_percentage DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department, course_id)
);
```

#### 3.1.9 shortage_reports
```sql
CREATE TABLE shortage_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(enrollment_id),
    report_date DATE NOT NULL,
    attendance_percentage DECIMAL(5,2),
    shortage_type VARCHAR(20) CHECK (shortage_type IN ('critical', 'warning', 'normal')),
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.10 notifications
```sql
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Database Triggers

#### 3.2.1 Trigger: Auto-update Attendance Summary
```sql
-- Function to update attendance summary
CREATE OR REPLACE FUNCTION update_attendance_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or Update attendance summary
    INSERT INTO attendance_summary (enrollment_id, total_classes, classes_attended, 
                                     classes_absent, classes_late, classes_excused,
                                     attendance_percentage, last_updated)
    SELECT 
        NEW.enrollment_id,
        COUNT(*) as total_classes,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as classes_attended,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as classes_absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as classes_late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as classes_excused,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0 
        END as attendance_percentage,
        CURRENT_TIMESTAMP
    FROM attendance_records
    WHERE enrollment_id = NEW.enrollment_id
    ON CONFLICT (enrollment_id) 
    DO UPDATE SET
        total_classes = EXCLUDED.total_classes,
        classes_attended = EXCLUDED.classes_attended,
        classes_absent = EXCLUDED.classes_absent,
        classes_late = EXCLUDED.classes_late,
        classes_excused = EXCLUDED.classes_excused,
        attendance_percentage = EXCLUDED.attendance_percentage,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_attendance_summary
AFTER INSERT OR UPDATE OR DELETE ON attendance_records
FOR EACH ROW
EXECUTE FUNCTION update_attendance_summary();
```

#### 3.2.2 Trigger: Check and Flag Shortage
```sql
CREATE OR REPLACE FUNCTION check_attendance_shortage()
RETURNS TRIGGER AS $$
DECLARE
    v_threshold DECIMAL(5,2);
    v_course_id UUID;
    v_department VARCHAR(100);
BEGIN
    -- Get course and department info
    SELECT c.course_id, s.department INTO v_course_id, v_department
    FROM course_enrollments ce
    JOIN students s ON ce.student_id = s.student_id
    JOIN courses c ON ce.course_id = c.course_id
    WHERE ce.enrollment_id = NEW.enrollment_id;
    
    -- Get applicable threshold
    SELECT COALESCE(
        (SELECT minimum_percentage FROM shortage_threshold 
         WHERE course_id = v_course_id AND is_active = TRUE),
        (SELECT minimum_percentage FROM shortage_threshold 
         WHERE department = v_department AND course_id IS NULL AND is_active = TRUE),
        75.00
    ) INTO v_threshold;
    
    -- Update shortage status
    UPDATE attendance_summary
    SET shortage_status = (NEW.attendance_percentage < v_threshold)
    WHERE enrollment_id = NEW.enrollment_id;
    
    -- Generate shortage report if needed
    IF NEW.attendance_percentage < v_threshold THEN
        INSERT INTO shortage_reports (enrollment_id, report_date, attendance_percentage, 
                                      shortage_type, notification_sent)
        VALUES (
            NEW.enrollment_id,
            CURRENT_DATE,
            NEW.attendance_percentage,
            CASE 
                WHEN NEW.attendance_percentage < (v_threshold - 10) THEN 'critical'
                WHEN NEW.attendance_percentage < v_threshold THEN 'warning'
                ELSE 'normal'
            END,
            FALSE
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_shortage
AFTER UPDATE OF attendance_percentage ON attendance_summary
FOR EACH ROW
EXECUTE FUNCTION check_attendance_shortage();
```

#### 3.2.3 Trigger: Send Notification on Shortage
```sql
CREATE OR REPLACE FUNCTION notify_shortage()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_course_name VARCHAR(255);
BEGIN
    -- Get student user_id and course name
    SELECT u.user_id, c.course_name INTO v_user_id, v_course_name
    FROM course_enrollments ce
    JOIN students s ON ce.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN courses c ON ce.course_id = c.course_id
    WHERE ce.enrollment_id = NEW.enrollment_id;
    
    -- Insert notification
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

CREATE TRIGGER trigger_notify_shortage
AFTER INSERT ON shortage_reports
FOR EACH ROW
WHEN (NEW.shortage_type IN ('warning', 'critical'))
EXECUTE FUNCTION notify_shortage();
```

### 3.3 Stored Procedures

#### 3.3.1 Bulk Attendance Update
```sql
CREATE OR REPLACE FUNCTION bulk_attendance_update(
    p_course_id UUID,
    p_class_date DATE,
    p_faculty_id UUID,
    p_attendance_data JSONB
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    v_record JSONB;
    v_enrollment_id UUID;
BEGIN
    -- Loop through attendance data
    FOR v_record IN SELECT * FROM jsonb_array_elements(p_attendance_data)
    LOOP
        -- Get enrollment_id
        SELECT enrollment_id INTO v_enrollment_id
        FROM course_enrollments ce
        JOIN students s ON ce.student_id = s.student_id
        WHERE ce.course_id = p_course_id
        AND s.roll_number = v_record->>'roll_number';
        
        -- Insert or update attendance
        INSERT INTO attendance_records (enrollment_id, class_date, status, marked_by)
        VALUES (
            v_enrollment_id,
            p_class_date,
            v_record->>'status',
            p_faculty_id
        )
        ON CONFLICT (enrollment_id, class_date)
        DO UPDATE SET
            status = EXCLUDED.status,
            marked_by = EXCLUDED.marked_by,
            marked_at = CURRENT_TIMESTAMP;
    END LOOP;
    
    RETURN QUERY SELECT TRUE, 'Attendance updated successfully';
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql;
```

#### 3.3.2 Generate Shortage Report
```sql
CREATE OR REPLACE FUNCTION generate_shortage_report(
    p_department VARCHAR(100) DEFAULT NULL,
    p_semester INTEGER DEFAULT NULL,
    p_course_id UUID DEFAULT NULL
)
RETURNS TABLE(
    roll_number VARCHAR(50),
    student_name VARCHAR(255),
    course_name VARCHAR(255),
    attendance_percentage DECIMAL(5,2),
    shortage_type VARCHAR(20),
    classes_attended INTEGER,
    total_classes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.roll_number,
        u.full_name as student_name,
        c.course_name,
        asummary.attendance_percentage,
        sr.shortage_type,
        asummary.classes_attended,
        asummary.total_classes
    FROM shortage_reports sr
    JOIN course_enrollments ce ON sr.enrollment_id = ce.enrollment_id
    JOIN students s ON ce.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN courses c ON ce.course_id = c.course_id
    JOIN attendance_summary asummary ON ce.enrollment_id = asummary.enrollment_id
    WHERE (p_department IS NULL OR s.department = p_department)
    AND (p_semester IS NULL OR s.semester = p_semester)
    AND (p_course_id IS NULL OR ce.course_id = p_course_id)
    AND asummary.shortage_status = TRUE
    ORDER BY asummary.attendance_percentage ASC;
END;
$$ LANGUAGE plpgsql;
```

### 3.4 Views

#### 3.4.1 Student Attendance Overview
```sql
CREATE VIEW vw_student_attendance_overview AS
SELECT 
    s.roll_number,
    u.full_name as student_name,
    s.department,
    s.semester,
    c.course_code,
    c.course_name,
    asummary.total_classes,
    asummary.classes_attended,
    asummary.classes_absent,
    asummary.attendance_percentage,
    asummary.shortage_status,
    CASE 
        WHEN asummary.shortage_status THEN 'Shortage'
        WHEN asummary.attendance_percentage >= 90 THEN 'Excellent'
        WHEN asummary.attendance_percentage >= 80 THEN 'Good'
        ELSE 'Satisfactory'
    END as attendance_grade
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN course_enrollments ce ON s.student_id = ce.student_id
JOIN courses c ON ce.course_id = c.course_id
JOIN attendance_summary asummary ON ce.enrollment_id = asummary.enrollment_id;
```

#### 3.4.2 Course Attendance Statistics
```sql
CREATE VIEW vw_course_attendance_stats AS
SELECT 
    c.course_id,
    c.course_code,
    c.course_name,
    c.department,
    c.semester,
    COUNT(DISTINCT ce.student_id) as total_students,
    AVG(asummary.attendance_percentage) as average_attendance,
    COUNT(CASE WHEN asummary.shortage_status THEN 1 END) as students_with_shortage,
    MAX(asummary.total_classes) as total_classes_conducted
FROM courses c
JOIN course_enrollments ce ON c.course_id = ce.course_id
JOIN attendance_summary asummary ON ce.enrollment_id = asummary.enrollment_id
GROUP BY c.course_id, c.course_code, c.course_name, c.department, c.semester;
```

### 3.5 Indexes for Performance
```sql
-- Indexes on foreign keys
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_attendance_records_enrollment ON attendance_records(enrollment_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(class_date);

-- Composite indexes for common queries
CREATE INDEX idx_attendance_enrollment_date ON attendance_records(enrollment_id, class_date);
CREATE INDEX idx_shortage_reports_enrollment_date ON shortage_reports(enrollment_id, report_date DESC);

-- Index for shortage queries
CREATE INDEX idx_attendance_summary_shortage ON attendance_summary(shortage_status) 
WHERE shortage_status = TRUE;
```

---

## 4. Functional Requirements

### 4.1 User Authentication & Authorization

#### 4.1.1 User Registration
- Users can register with email, password, and role selection
- Email verification required before account activation
- Password must meet complexity requirements (8+ chars, uppercase, lowercase, number, special char)
- Unique roll number for students, employee ID for faculty

#### 4.1.2 User Login
- Login using email and password
- JWT token generation with 24-hour expiry
- Refresh token mechanism for extended sessions
- Remember me functionality (optional)
- Account lockout after 5 failed login attempts

#### 4.1.3 Role-Based Access Control
- **Student:** View personal attendance, download reports, view notifications
- **Faculty:** Mark attendance, view class reports, manage courses
- **Admin:** Full system access, user management, system configuration

#### 4.1.4 Password Management
- Forgot password with email-based reset link
- Change password with old password verification
- Password reset link expires after 1 hour

### 4.2 Student Module

#### 4.2.1 Dashboard
- Display overall attendance percentage across all courses
- Show courses with shortage status
- Display upcoming classes
- Show recent notifications
- Quick statistics: total classes, attended, percentage

#### 4.2.2 View Attendance
- Course-wise attendance breakdown
- Calendar view showing present/absent days
- Filter by date range, course, semester
- Color-coded status indicators (green=present, red=absent, yellow=late, blue=excused)
- Export attendance as PDF/Excel

#### 4.2.3 Shortage Alerts
- Real-time shortage notifications
- Detailed view of courses with attendance below threshold
- Calculate required attendance to meet minimum percentage
- Historical shortage trends

#### 4.2.4 Attendance Reports
- Generate custom reports by date range
- Comparison charts across courses
- Monthly/semester-wise attendance trends
- Download reports in PDF/Excel format

### 4.3 Faculty Module

#### 4.3.1 Dashboard
- List of assigned courses
- Quick attendance marking interface
- Summary of today's classes
- Student shortage count by course
- Attendance submission history

#### 4.3.2 Mark Attendance
- Select course and date
- Display student roster with roll numbers
- Quick mark all present/absent options
- Individual status selection (present/absent/late/excused)
- Add remarks for specific students
- Bulk upload via Excel template
- Edit previously marked attendance (within 24 hours)

#### 4.3.3 Class Management
- View enrolled students for each course
- Student-wise attendance details
- Export class attendance reports
- Send bulk notifications to students

#### 4.3.4 Reports & Analytics
- Course-wise attendance statistics
- Identify students with low attendance
- Attendance trends over time
- Comparison across different batches
- Export comprehensive reports

### 4.4 Admin Module

#### 4.4.1 Dashboard
- System-wide statistics
- Total users (students, faculty)
- Overall attendance percentage
- Department-wise breakdown
- Recent activities log

#### 4.4.2 User Management
- Create, read, update, delete users
- Assign roles and permissions
- Activate/deactivate accounts
- Reset user passwords
- Import users via CSV

#### 4.4.3 Course Management
- Create and manage courses
- Assign faculty to courses
- Enroll students in courses
- Set course details (credits, semester, department)
- Bulk enrollment via Excel

#### 4.4.4 Threshold Configuration
- Set minimum attendance percentage (default 75%)
- Configure warning threshold (default 80%)
- Department-specific thresholds
- Course-specific thresholds
- Override rules

#### 4.4.5 Reports & Analytics
- Generate department-wide reports
- Semester-wise attendance analysis
- Faculty performance reports
- Student shortage reports
- Export data for external analysis
- Schedule automated report generation

#### 4.4.6 System Configuration
- Academic year settings
- Notification templates
- Email server configuration
- System maintenance mode
- Backup and restore

### 4.5 Notification System

#### 4.5.1 In-App Notifications
- Real-time notifications in the application
- Mark as read/unread
- Delete notifications
- Notification badge count

#### 4.5.2 Email Notifications
- Shortage alerts to students
- Weekly attendance summary
- Faculty reminders for unmarked attendance
- Admin alerts for critical issues

#### 4.5.3 Notification Types
- Attendance marked
- Shortage warning (attendance drops below warning threshold)
- Critical shortage (attendance drops below minimum threshold)
- Weekly attendance summary
- Course enrollment confirmation
- Password reset
- Account activation

### 4.6 Reporting System

#### 4.6.1 Report Types
- Individual student attendance report
- Course-wise attendance report
- Department attendance summary
- Shortage report (students below threshold)
- Faculty activity report
- Monthly/semester attendance trends

#### 4.6.2 Export Formats
- PDF (formatted reports with charts)
- Excel (raw data with multiple sheets)
- CSV (for data analysis)

#### 4.6.3 Report Scheduling
- Schedule daily/weekly/monthly reports
- Email reports to stakeholders
- Archive historical reports

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Page load time < 2 seconds
- API response time < 500ms for 90% of requests
- Support 500+ concurrent users
- Database query optimization using indexes and caching
- Implement pagination for large datasets (50 records per page)

### 5.2 Security
- HTTPS for all communications
- JWT token-based authentication
- Password hashing using bcrypt (cost factor 12)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token implementation
- Rate limiting on API endpoints
- Secure password reset mechanism
- Session timeout after 30 minutes of inactivity

### 5.3 Scalability
- Horizontal scaling support
- Database connection pooling
- Caching strategy using Redis (optional)
- CDN for static assets
- Modular architecture for easy feature addition

### 5.4 Reliability
- 99.5% uptime target
- Automated database backups (daily)
- Error logging and monitoring
- Graceful error handling
- Data validation at multiple layers

### 5.5 Usability
- Intuitive and clean UI
- Responsive design (mobile, tablet, desktop)
- Accessible design (WCAG 2.1 Level AA compliance)
- Multi-language support (future enhancement)
- Consistent navigation across modules
- Help documentation and tooltips

### 5.6 Maintainability
- Well-documented code
- Modular architecture
- Version control using Git
- Code review process
- Automated testing (unit, integration)
- CI/CD pipeline setup

### 5.7 Compatibility
- Browser support: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers: iOS Safari, Chrome Mobile
- Minimum screen resolution: 320px width

---

## 6. API Endpoints Design

### 6.1 Authentication APIs

```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
POST   /api/auth/refresh-token     - Refresh JWT token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
POST   /api/auth/verify-email      - Verify email address
GET    /api/auth/me                - Get current user info
PUT    /api/auth/change-password   - Change password
```

### 6.2 Student APIs

```
GET    /api/students/dashboard              - Get dashboard data
GET    /api/students/attendance             - Get attendance records
GET    /api/students/attendance/summary     - Get attendance summary
GET    /api/students/courses                - Get enrolled courses
GET    /api/students/shortage               - Get shortage details
GET    /api/students/notifications          - Get notifications
PUT    /api/students/notifications/:id      - Mark notification as read
GET    /api/students/reports/generate       - Generate attendance report
GET    /api/students/profile                - Get student profile
PUT    /api/students/profile                - Update student profile
```

### 6.3 Faculty APIs

```
GET    /api/faculty/dashboard               - Get dashboard data
GET    /api/faculty/courses                 - Get assigned courses
GET    /api/faculty/courses/:id/students    - Get students in a course
POST   /api/faculty/attendance/mark         - Mark attendance
POST   /api/faculty/attendance/bulk         - Bulk attendance upload
GET    /api/faculty/attendance/history      - Get attendance marking history
PUT    /api/faculty/attendance/:id          - Edit attendance record
GET    /api/faculty/reports/course/:id      - Generate course report
GET    /api/faculty/students/:id/attendance - Get student attendance details
POST   /api/faculty/notifications/send      - Send notification to students
```

### 6.4 Admin APIs

```
GET    /api/admin/dashboard                 - Get admin dashboard
GET    /api/admin/users                     - Get all users (paginated)
POST   /api/admin/users                     - Create new user
GET    /api/admin/users/:id                 - Get user details
PUT    /api/admin/users/:id                 - Update user
DELETE /api/admin/users/:id                 - Delete user
POST   /api/admin/users/bulk-import         - Import users via CSV

GET    /api/admin/courses                   - Get all courses
POST   /api/admin/courses                   - Create course
PUT    /api/admin/courses/:id               - Update course
DELETE /api/admin/courses/:id               - Delete course
POST   /api/admin/courses/:id/enroll        - Enroll students in course
POST   /api/admin/courses/bulk-enroll       - Bulk enrollment

GET    /api/admin/threshold                 - Get threshold settings
PUT    /api/admin/threshold                 - Update threshold
GET    /api/admin/reports/shortage          - Generate shortage report
GET    /api/admin/reports/department        - Generate department report
GET    /api/admin/reports/faculty           - Generate faculty activity report

GET    /api/admin/settings                  - Get system settings
PUT    /api/admin/settings                  - Update system settings
POST   /api/admin/backup                    - Trigger database backup
GET    /api/admin/logs                      - Get system logs
```

### 6.5 Common APIs

```
GET    /api/departments                     - Get all departments
GET    /api/courses/search                  - Search courses
GET    /api/notifications                   - Get user notifications
DELETE /api/notifications/:id               - Delete notification
POST   /api/upload                          - Upload file
GET    /api/download/:filename              - Download file
```

---

## 7. User Interface Design

### 7.1 Design Principles
- **Simplicity:** Clean and minimal interface
- **Consistency:** Uniform design across all pages
- **Feedback:** Clear feedback for user actions
- **Accessibility:** Keyboard navigation, screen reader support
- **Responsive:** Mobile-first approach

### 7.2 Color Scheme
- Primary: #3B82F6 (Blue)
- Secondary: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Danger: #EF4444 (Red)
- Background: #F3F4F6 (Light Gray)
- Text: #1F2937 (Dark Gray)

### 7.3 Key Pages

#### 7.3.1 Login Page
- Centered login form
- Email and password fields
- Remember me checkbox
- Forgot password link
- Login button
- Register link for new users

#### 7.3.2 Student Dashboard
- Header with user info and notifications icon
- Sidebar navigation
- Overall attendance percentage (large display)
- Cards showing course-wise attendance
- Shortage alerts section
- Recent activity timeline
- Quick action buttons

#### 7.3.3 Faculty Attendance Marking
- Course and date selection
- Student list with roll numbers
- Quick action buttons (Mark all Present/Absent)
- Status dropdown for each student
- Remarks field
- Submit button
- Success/error messages

#### 7.3.4 Admin Dashboard
- Statistics cards (users, courses, overall attendance)
- Charts showing trends
- Recent activities
- Quick links to key functions
- System health indicators

### 7.4 Component Library
- Buttons (primary, secondary, danger, outline)
- Input fields (text, email, password, date, select)
- Tables (sortable, filterable, paginated)
- Cards
- Modals/Dialogs
- Alerts/Notifications
- Charts (line, bar, pie, donut)
- Loading spinners
- Breadcrumbs
- Tabs
- Badges
- Progress bars

---

## 8. Implementation Plan

### 8.1 Phase 1: Foundation (Week 1-2)
- Set up development environment
- Initialize React project with Vite
- Set up FastAPI backend structure
- Configure Supabase database
- Create database schema (tables, relationships)
- Implement authentication system (JWT)
- Create base UI components

### 8.2 Phase 2: Core Features (Week 3-5)
- Implement user management (CRUD)
- Build student registration and profile
- Create course management system
- Implement attendance marking functionality
- Create database triggers for automatic calculations
- Build attendance summary calculation
- Develop student dashboard

### 8.3 Phase 3: Advanced Features (Week 6-7)
- Implement shortage detection trigger
- Build notification system
- Create report generation module
- Implement faculty dashboard
- Add bulk attendance upload
- Create admin dashboard and controls

### 8.4 Phase 4: Reporting & Analytics (Week 8)
- Implement various report types
- Add export functionality (PDF, Excel)
- Create data visualization charts
- Build attendance trends analysis
- Implement scheduled reports

### 8.5 Phase 5: Testing & Refinement (Week 9-10)
- Unit testing for backend APIs
- Integration testing
- UI/UX testing
- Performance testing
- Security testing
- Bug fixes and optimizations

### 8.6 Phase 6: Deployment & Documentation (Week 11-12)
- Prepare production environment
- Deploy backend on cloud (AWS/Heroku/Railway)
- Deploy frontend on Vercel/Netlify
- Configure Supabase for production
- Write user documentation
- Create API documentation
- Prepare project presentation

---

## 9. Testing Strategy

### 9.1 Unit Testing
- Test individual functions and methods
- Test database triggers and procedures
- Test API endpoints
- Use pytest for backend, Jest for frontend

### 9.2 Integration Testing
- Test API integration with frontend
- Test database triggers with API operations
- Test authentication flow
- Test file upload/download

### 9.3 End-to-End Testing
- Test complete user workflows
- Student attendance viewing flow
- Faculty attendance marking flow
- Admin report generation flow
- Use Selenium or Playwright

### 9.4 Performance Testing
- Load testing with multiple concurrent users
- Database query performance
- API response time testing
- Use tools like Locust or JMeter

### 9.5 Security Testing
- Authentication bypass attempts
- SQL injection testing
- XSS vulnerability testing
- CSRF protection testing
- Password security testing

### 9.6 User Acceptance Testing
- Test with actual students and faculty
- Gather feedback on usability
- Identify missing features
- Validate business requirements

---

## 10. Deployment Architecture

### 10.1 Frontend Deployment
- **Platform:** Vercel or Netlify
- **Build:** Production build with optimization
- **Environment Variables:** API URL, Supabase keys
- **CDN:** Automatic via platform
- **SSL:** Automatic HTTPS

### 10.2 Backend Deployment
- **Platform:** Railway, Render, or AWS EC2
- **Server:** Uvicorn with 4 workers
- **Process Manager:** Supervisor or systemd
- **Environment Variables:** Database URL, JWT secret, email credentials
- **Logging:** Cloud logging service

### 10.3 Database
- **Platform:** Supabase (managed PostgreSQL)
- **Backups:** Daily automated backups
- **Monitoring:** Supabase dashboard
- **Connection Pooling:** Enabled

### 10.4 Domain & SSL
- Custom domain configuration
- SSL certificate (Let's Encrypt)
- HTTPS enforcement

---

## 11. Database Cursor Implementation Examples

### 11.1 Cursor for Batch Processing
```sql
CREATE OR REPLACE FUNCTION process_daily_attendance()
RETURNS VOID AS $$
DECLARE
    attendance_cursor CURSOR FOR 
        SELECT enrollment_id, class_date, status
        FROM attendance_records
        WHERE class_date = CURRENT_DATE;
    
    v_record RECORD;
BEGIN
    OPEN attendance_cursor;
    
    LOOP
        FETCH attendance_cursor INTO v_record;
        EXIT WHEN NOT FOUND;
        
        -- Process each attendance record
        -- Custom business logic here
        RAISE NOTICE 'Processing enrollment: %, Date: %, Status: %', 
            v_record.enrollment_id, v_record.class_date, v_record.status;
    END LOOP;
    
    CLOSE attendance_cursor;
END;
$$ LANGUAGE plpgsql;
```

### 11.2 Cursor for Report Generation
```sql
CREATE OR REPLACE FUNCTION generate_monthly_report(p_month INTEGER, p_year INTEGER)
RETURNS TABLE(roll_number VARCHAR, student_name VARCHAR, total_classes INTEGER, 
              attended INTEGER, percentage DECIMAL) AS $$
DECLARE
    student_cursor CURSOR FOR
        SELECT s.student_id, s.roll_number, u.full_name
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.is_active = TRUE;
    
    v_student RECORD;
    v_total INTEGER;
    v_attended INTEGER;
BEGIN
    FOR v_student IN student_cursor
    LOOP
        -- Calculate attendance for the month
        SELECT 
            COUNT(*),
            SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END)
        INTO v_total, v_attended
        FROM attendance_records ar
        JOIN course_enrollments ce ON ar.enrollment_id = ce.enrollment_id
        WHERE ce.student_id = v_student.student_id
        AND EXTRACT(MONTH FROM ar.class_date) = p_month
        AND EXTRACT(YEAR FROM ar.class_date) = p_year;
        
        RETURN QUERY SELECT 
            v_student.roll_number,
            v_student.full_name,
            v_total,
            v_attended,
            CASE WHEN v_total > 0 THEN ROUND((v_attended::DECIMAL / v_total) * 100, 2) 
                 ELSE 0 END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## 12. Environment Setup Guide

### 12.1 Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git
- Supabase account
- Code editor (VS Code recommended)

### 12.2 Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose[cryptography] \
    passlib[bcrypt] python-multipart pydantic[email] python-dotenv \
    reportlab openpyxl

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
EOF

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 12.3 Frontend Setup
```bash
# Create React app
npm create vite@latest attendance-frontend -- --template react

# Navigate to project
cd attendance-frontend

# Install dependencies
npm install react-router-dom axios recharts tailwindcss \
    react-hook-form react-toastify date-fns

# Initialize TailwindCSS
npx tailwindcss init -p

# Start development server
npm run dev
```

### 12.4 Database Setup (Supabase)
1. Create Supabase project
2. Go to SQL Editor
3. Execute table creation scripts
4. Create triggers and functions
5. Create views
6. Set up Row Level Security (RLS) policies
7. Get connection string and API keys

---

## 13. Sample Data Structure

### 13.1 User Registration Request
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "role": "student",
  "full_name": "John Doe",
  "phone": "+919876543210",
  "roll_number": "21CS001",
  "department": "Computer Science",
  "semester": 6,
  "batch_year": 2021
}
```

### 13.2 Attendance Marking Request
```json
{
  "course_id": "uuid-here",
  "class_date": "2026-02-03",
  "attendance_data": [
    {
      "roll_number": "21CS001",
      "status": "present",
      "remarks": ""
    },
    {
      "roll_number": "21CS002",
      "status": "absent",
      "remarks": "Medical leave"
    },
    {
      "roll_number": "21CS003",
      "status": "late",
      "remarks": "Arrived 15 minutes late"
    }
  ]
}
```

### 13.3 Attendance Summary Response
```json
{
  "student_id": "uuid-here",
  "roll_number": "21CS001",
  "student_name": "John Doe",
  "courses": [
    {
      "course_id": "uuid-here",
      "course_code": "CS601",
      "course_name": "Machine Learning",
      "total_classes": 40,
      "classes_attended": 35,
      "classes_absent": 5,
      "classes_late": 2,
      "classes_excused": 0,
      "attendance_percentage": 87.5,
      "shortage_status": false,
      "grade": "Good"
    }
  ],
  "overall_attendance": 85.3,
  "total_courses": 6
}
```

---

## 14. Security Considerations

### 14.1 Authentication Security
- Implement JWT with short expiry times
- Use refresh tokens for session management
- Store tokens securely (httpOnly cookies)
- Implement token blacklisting on logout

### 14.2 Data Security
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement rate limiting to prevent abuse
- Sanitize all user inputs
- Use parameterized queries to prevent SQL injection

### 14.3 Access Control
- Implement strict role-based access control
- Validate user permissions on every request
- Prevent horizontal privilege escalation
- Log all access attempts

### 14.4 Password Security
- Minimum password requirements enforced
- Use bcrypt with cost factor 12
- Implement account lockout after failed attempts
- Secure password reset mechanism with time-limited tokens

---

## 15. Future Enhancements

### 15.1 Phase 2 Features
- Mobile app (React Native)
- Biometric attendance (facial recognition)
- QR code-based attendance
- Geofencing for location-based attendance
- Integration with existing ERP systems
- SMS notifications
- Parent portal
- Attendance prediction using ML

### 15.2 Advanced Analytics
- Predictive analytics for at-risk students
- Attendance pattern analysis
- Correlation between attendance and performance
- Department comparison dashboards
- Time-series forecasting

### 15.3 Integration Possibilities
- Google Calendar integration
- Microsoft Teams integration
- Zoom integration for online classes
- LMS integration (Moodle, Canvas)
- Payment gateway for fine collection

---

## 16. Success Metrics

### 16.1 Technical Metrics
- System uptime: 99.5%
- Average API response time: < 500ms
- Page load time: < 2 seconds
- Zero critical security vulnerabilities
- Database query time: < 100ms for 95% of queries

### 16.2 Business Metrics
- 100% of students have access to real-time attendance
- 90% reduction in manual attendance tracking errors
- 80% reduction in time spent on attendance management
- 95% user satisfaction rate
- 100% automated shortage report generation

### 16.3 User Adoption Metrics
- 90% of faculty actively using the system
- 95% of students logging in weekly
- 80% reduction in attendance-related queries
- Average session duration: 5-10 minutes

---

## 17. Risks & Mitigation

### 17.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database performance issues | Medium | High | Implement caching, optimize queries, use indexes |
| Third-party service downtime | Low | High | Have fallback mechanisms, use multiple providers |
| Security breach | Low | Critical | Regular security audits, penetration testing |
| Data loss | Low | Critical | Daily automated backups, disaster recovery plan |
| Scalability issues | Medium | Medium | Design for horizontal scaling from start |

### 17.2 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| User resistance to adoption | Medium | High | Training sessions, user-friendly interface |
| Incorrect attendance marking | Medium | Medium | Verification mechanisms, edit functionality |
| Network connectivity issues | Medium | Medium | Offline capability, data sync when online |
| Regulatory compliance | Low | High | Legal review, privacy policy, data protection |

---

## 18. Support & Maintenance

### 18.1 User Support
- Email support: support@attendance.edu
- Help documentation and FAQs
- Video tutorials
- In-app chat support (future)
- Issue tracking system

### 18.2 System Maintenance
- Monthly security updates
- Quarterly feature releases
- Weekly database optimization
- Daily backups
- 24/7 monitoring

### 18.3 Documentation
- User manual for each role
- API documentation (Swagger/OpenAPI)
- Database schema documentation
- Deployment guide
- Troubleshooting guide

---

## 19. Compliance & Standards

### 19.1 Data Privacy
- GDPR compliance (if applicable)
- Data retention policies
- User consent management
- Right to data deletion
- Data portability

### 19.2 Educational Standards
- Align with institutional policies
- Follow academic calendar
- Support multiple grading systems
- Comply with accreditation requirements

### 19.3 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Responsive design

---

## 20. Glossary

- **Attendance Percentage:** Ratio of classes attended to total classes conducted, expressed as a percentage
- **Cursor:** Database programming construct used to retrieve and process rows returned by a query one at a time
- **Enrollment:** The act of registering a student for a specific course
- **Shortage:** Attendance percentage below the institutional minimum threshold (typically 75%)
- **Trigger:** Database object that automatically executes in response to certain events on a table
- **JWT (JSON Web Token):** A compact, URL-safe means of representing claims to be transferred between two parties
- **RLS (Row Level Security):** Database feature that restricts which rows users can access in tables
- **CRUD:** Create, Read, Update, Delete - the four basic operations of persistent storage

---

## 21. Appendices

### Appendix A: Sample SQL Queries
```sql
-- Get students with critical shortage
SELECT s.roll_number, u.full_name, c.course_name, asummary.attendance_percentage
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN course_enrollments ce ON s.student_id = ce.student_id
JOIN courses c ON ce.course_id = c.course_id
JOIN attendance_summary asummary ON ce.enrollment_id = asummary.enrollment_id
WHERE asummary.attendance_percentage < 65
ORDER BY asummary.attendance_percentage ASC;

-- Get daily attendance statistics
SELECT 
    c.course_name,
    COUNT(DISTINCT ce.student_id) as total_students,
    SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
    ROUND(AVG(CASE WHEN ar.status = 'present' THEN 100 ELSE 0 END), 2) as attendance_percentage
FROM courses c
JOIN course_enrollments ce ON c.course_id = ce.course_id
LEFT JOIN attendance_records ar ON ce.enrollment_id = ar.enrollment_id 
    AND ar.class_date = CURRENT_DATE
GROUP BY c.course_id, c.course_name;
```

### Appendix B: Environment Variables
```
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/attendance_db
SECRET_KEY=your-256-bit-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Frontend (.env)
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Appendix C: Project File Structure
```
attendance-monitoring-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── student.py
│   │   │   ├── faculty.py
│   │   │   ├── course.py
│   │   │   └── attendance.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── student.py
│   │   │   └── attendance.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── students.py
│   │   │   ├── faculty.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── attendance_service.py
│   │   │   └── report_service.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── security.py
│   │       └── email.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── student/
│   │   │   ├── faculty/
│   │   │   └── admin/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── FacultyDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── attendanceService.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
├── database/
│   ├── schema.sql
│   ├── triggers.sql
│   ├── procedures.sql
│   └── sample_data.sql
└── docs/
    ├── PRD.md
    ├── API_Documentation.md
    └── User_Manual.md
```

---

## 22. Conclusion

This Product Requirements Document provides a comprehensive blueprint for developing the Attendance Monitoring System. The system leverages modern web technologies (React, FastAPI) with a robust PostgreSQL database (Supabase) to create an efficient, automated attendance tracking solution.

The use of database records, triggers, and cursors ensures data integrity and automatic calculations, while the role-based architecture provides appropriate access and functionality to all stakeholders. The modular design allows for easy maintenance and future enhancements.

### Key Strengths
1. **Automation:** Triggers automatically calculate attendance percentages and generate shortage reports
2. **Real-time Updates:** Instant notification of attendance status
3. **Comprehensive Reporting:** Multiple report types with export capabilities
4. **Scalable Architecture:** Designed to handle growing user base and data
5. **User-Friendly:** Intuitive interface for all user types
6. **Secure:** Multiple layers of security and authentication

### Academic Value
This project demonstrates proficiency in:
- Full-stack web development
- Database design with advanced features (triggers, cursors, stored procedures)
- RESTful API development
- Authentication and authorization
- Real-world problem solving
- Software engineering best practices

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Owner | [Your Name] | __________ | __________ |
| Faculty Advisor | [Advisor Name] | __________ | __________ |
| Technical Reviewer | [Reviewer Name] | __________ | __________ |

---

**Document Version:** 1.0  
**Last Updated:** February 3, 2026  
**Next Review Date:** March 3, 2026  

---

*This document is confidential and intended solely for academic purposes.*
