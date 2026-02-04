import sqlite3
import os

db_path = "attendance.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check courses table
    cursor.execute("PRAGMA table_info(courses)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "room_number" not in columns:
        print("Adding room_number to courses")
        cursor.execute("ALTER TABLE courses ADD COLUMN room_number TEXT")
        
    if "syllabus_link" not in columns:
        print("Adding syllabus_link to courses")
        cursor.execute("ALTER TABLE courses ADD COLUMN syllabus_link TEXT")
        
    # Check attendance_records table
    cursor.execute("PRAGMA table_info(attendance_records)")
    columns = [row[1] for row in cursor.fetchall()]
    if "marked_by" not in columns:
        print("Adding marked_by to attendance_records")
        cursor.execute("ALTER TABLE attendance_records ADD COLUMN marked_by BLOB")
        
    conn.commit()
    conn.close()
    print("Database schema updated successfully.")
else:
    print(f"Database {db_path} not found.")
