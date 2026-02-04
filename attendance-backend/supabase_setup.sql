-- SUPABASE SQL FOR ATTENDANCE MONITORING SYSTEM
-- Run this in the Supabase SQL Editor to activate the "Brain" of the system.

-- 1. Create Function to Update Attendance Summary
CREATE OR REPLACE FUNCTION update_attendance_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_enrollment_id UUID;
    v_total INTEGER;
    v_attended INTEGER;
    v_late INTEGER;
    v_percentage DECIMAL;
    v_threshold DECIMAL := 75.0;
BEGIN
    -- Determine which enrollment_id to update
    IF (TG_OP = 'DELETE') THEN
        v_enrollment_id := OLD.enrollment_id;
    ELSE
        v_enrollment_id := NEW.enrollment_id;
    END IF;

    -- Calculate current stats
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'present'),
        COUNT(*) FILTER (WHERE status = 'late')
    INTO v_total, v_attended, v_late
    FROM attendance_records
    WHERE enrollment_id = v_enrollment_id;

    -- Calculate percentage (Present + Late count as attended)
    IF v_total > 0 THEN
        v_percentage := ((v_attended + v_late)::DECIMAL / v_total::DECIMAL) * 100;
    ELSE
        v_percentage := 0;
    END IF;

    -- Update or Insert into attendance_summary table
    INSERT INTO attendance_summary (
        enrollment_id, 
        total_classes, 
        classes_attended, 
        classes_absent, 
        classes_late, 
        classes_excused,
        attendance_percentage,
        shortage_status,
        last_updated
    )
    VALUES (
        v_enrollment_id,
        v_total,
        v_attended,
        (SELECT COUNT(*) FROM attendance_records WHERE enrollment_id = v_enrollment_id AND status = 'absent'),
        v_late,
        (SELECT COUNT(*) FROM attendance_records WHERE enrollment_id = v_enrollment_id AND status = 'excused'),
        v_percentage,
        (v_percentage < v_threshold),
        NOW()
    )
    ON CONFLICT (enrollment_id) DO UPDATE SET
        total_classes = EXCLUDED.total_classes,
        classes_attended = EXCLUDED.classes_attended,
        classes_absent = EXCLUDED.classes_absent,
        classes_late = EXCLUDED.classes_late,
        classes_excused = EXCLUDED.classes_excused,
        attendance_percentage = EXCLUDED.attendance_percentage,
        shortage_status = EXCLUDED.shortage_status,
        last_updated = EXCLUDED.last_updated;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Bind Trigger to attendance_records Table
DROP TRIGGER IF EXISTS trigger_update_attendance_summary ON attendance_records;
CREATE TRIGGER trigger_update_attendance_summary
AFTER INSERT OR UPDATE OR DELETE ON attendance_records
FOR EACH ROW
EXECUTE FUNCTION update_attendance_summary();

-- 3. Notification Logic (Optional/Placeholder)
CREATE OR REPLACE FUNCTION notify_shortage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.shortage_status = TRUE AND (OLD.shortage_status = FALSE OR OLD.shortage_status IS NULL) THEN
        -- Here you could insert into a notifications table
        INSERT INTO notifications (user_id, message, type, created_at)
        SELECT 
            s.user_id, 
            'Attendance shortage alert! Your attendance has fallen below 75%.', 
            'shortage', 
            NOW()
        FROM students s
        JOIN course_enrollments e ON s.student_id = e.student_id
        WHERE e.enrollment_id = NEW.enrollment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_shortage ON attendance_summary;
CREATE TRIGGER trigger_notify_shortage
AFTER UPDATE ON attendance_summary
FOR EACH ROW
EXECUTE FUNCTION notify_shortage();

-- Logic Flow Explanation:
-- 1. Faculty/Admin inserts a record into 'attendance_records'.
-- 2. 'trigger_update_attendance_summary' fires AFTER INSERT/UPDATE.
-- 3. 'update_attendance_summary()' calculates totals and percentage.
-- 4. 'attendance_summary' table is updated via UPSERT.
-- 5. If percentage < 75, 'shortage_status' becomes TRUE.
-- 6. 'trigger_notify_shortage' fires on 'attendance_summary' update, potentially alerting the student.
