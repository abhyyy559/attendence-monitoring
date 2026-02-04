from sqlalchemy import text
from app.database import engine

def patch_courses():
    with engine.connect() as conn:
        print("Patching 'courses' table...")
        
        # Add room_number if missing
        try:
            conn.execute(text("ALTER TABLE courses ADD COLUMN room_number VARCHAR(50)"))
            conn.commit()
            print("Added room_number.")
        except Exception as e:
            conn.rollback()
            print(f"room_number likely exists or: {e}")

        # Add syllabus_link if missing
        try:
            conn.execute(text("ALTER TABLE courses ADD COLUMN syllabus_link VARCHAR(500)"))
            conn.commit()
            print("Added syllabus_link.")
        except Exception as e:
            conn.rollback()
            print(f"syllabus_link likely exists or: {e}")

        # Add total_classes if missing
        try:
            conn.execute(text("ALTER TABLE courses ADD COLUMN total_classes INTEGER DEFAULT 0"))
            conn.commit()
            print("Added total_classes.")
        except Exception as e:
            conn.rollback()
            print(f"total_classes likely exists or: {e}")

if __name__ == "__main__":
    patch_courses()
