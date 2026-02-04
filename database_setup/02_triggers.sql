-- TRIGGER 1: Auto-update attendance summary
CREATE OR REPLACE FUNCTION update_attendance_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO attendance_summary (
        enrollment_id, total_classes, classes_attended, 
        classes_absent, classes_late, classes_excused,
        attendance_percentage, last_updated
    )
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

CREATE TRIGGER trigger_update_attendance_summary
AFTER INSERT OR UPDATE OR DELETE ON attendance_records
FOR EACH ROW
EXECUTE FUNCTION update_attendance_summary();

-- TRIGGER 2: Check and flag shortage
CREATE OR REPLACE FUNCTION check_attendance_shortage()
RETURNS TRIGGER AS $$
DECLARE
    v_threshold DECIMAL(5,2);
    v_course_id UUID;
    v_department VARCHAR(100);
BEGIN
    SELECT c.course_id, s.department INTO v_course_id, v_department
    FROM course_enrollments ce
    JOIN students s ON ce.student_id = s.student_id
    JOIN courses c ON ce.course_id = c.course_id
    WHERE ce.enrollment_id = NEW.enrollment_id;
    
    SELECT COALESCE(
        (SELECT minimum_percentage FROM shortage_threshold 
         WHERE course_id = v_course_id AND is_active = TRUE),
        (SELECT minimum_percentage FROM shortage_threshold 
         WHERE department = v_department AND course_id IS NULL AND is_active = TRUE),
        75.00
    ) INTO v_threshold;
    
    UPDATE attendance_summary
    SET shortage_status = (NEW.attendance_percentage < v_threshold)
    WHERE enrollment_id = NEW.enrollment_id;
    
    IF NEW.attendance_percentage < v_threshold THEN
        INSERT INTO shortage_reports (
            enrollment_id, report_date, attendance_percentage, 
            shortage_type, notification_sent
        )
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

-- TRIGGER 3: Send notification on shortage
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

CREATE TRIGGER trigger_notify_shortage
AFTER INSERT ON shortage_reports
FOR EACH ROW
WHEN (NEW.shortage_type IN ('warning', 'critical'))
EXECUTE FUNCTION notify_shortage();
