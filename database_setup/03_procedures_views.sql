-- Procedure 1: Bulk attendance update
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
    FOR v_record IN SELECT * FROM jsonb_array_elements(p_attendance_data)
    LOOP
        SELECT enrollment_id INTO v_enrollment_id
        FROM course_enrollments ce
        JOIN students s ON ce.student_id = s.student_id
        WHERE ce.course_id = p_course_id
        AND s.roll_number = v_record->>'roll_number';
        
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

-- Procedure 2: Generate shortage report
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

-- View 1: Student attendance overview
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

-- View 2: Course attendance statistics
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
