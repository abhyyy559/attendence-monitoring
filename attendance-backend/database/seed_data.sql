-- SQLite Compatible Seed Data
-- 1. INSERT USERS (Password is 'password123' for all)
-- Hash generated for 'password123'
INSERT OR IGNORE INTO users (user_id, email, password_hash, role, full_name, phone) VALUES
(hex(randomblob(16)), 'admin@college.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5TQhUqRQvp7M.', 'admin', 'Dr. Admin User', '9876543210'),
(hex(randomblob(16)), 'faculty@college.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5TQhUqRQvp7M.', 'faculty', 'Prof. Jane Smith', '9876543211'),
(hex(randomblob(16)), 'student@college.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5TQhUqRQvp7M.', 'student', 'John Doe', '9876543212');

-- 2. INSERT STUDENTS & FACULTY DETAILS
INSERT OR IGNORE INTO students (student_id, user_id, roll_number, department, semester, batch_year, enrollment_date)
SELECT hex(randomblob(16)), user_id, 'CS2024001', 'Computer Science', 6, 2021, date('now')
FROM users WHERE email = 'student@college.edu';

INSERT OR IGNORE INTO faculty (faculty_id, user_id, employee_id, department, designation)
SELECT hex(randomblob(16)), user_id, 'FAC001', 'Computer Science', 'Professor'
FROM users WHERE email = 'faculty@college.edu';

-- 3. INSERT COURSES
INSERT OR IGNORE INTO courses (course_id, course_code, course_name, department, semester, credits, total_classes) VALUES
(hex(randomblob(16)), 'CS601', 'Data Structures', 'Computer Science', 6, 4, 40),
(hex(randomblob(16)), 'CS602', 'Operating Systems', 'Computer Science', 6, 4, 40),
(hex(randomblob(16)), 'CS603', 'Database Management', 'Computer Science', 6, 4, 40);

-- 4. ENROLL STUDENT IN COURSES
INSERT OR IGNORE INTO course_enrollments (enrollment_id, student_id, course_id, faculty_id, academic_year)
SELECT 
    hex(randomblob(16)),
    s.student_id, 
    c.course_id, 
    f.faculty_id, 
    '2024-2025'
FROM students s
CROSS JOIN courses c
CROSS JOIN faculty f
WHERE s.roll_number = 'CS2024001';

-- Note: Attendance generation is better done via Python for complex logic like random dates in a loop.
