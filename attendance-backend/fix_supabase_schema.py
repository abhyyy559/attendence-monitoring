from sqlalchemy import text
from app.database import engine

def fix_schema():
    with engine.connect() as conn:
        print("Dropping users_role_check constraint...")
        try:
            # Check if it exists for PostgreSQL
            conn.execute(text("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check"))
            conn.commit()
            print("Constraint dropped successfully.")
        except Exception as e:
            print(f"Error dropping constraint: {e}")
            conn.rollback()

if __name__ == "__main__":
    fix_schema()
