from app.database import engine, Base
from app.models.user import User
from app.models.student import Student
import sys

print("Attempting to create tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")
except Exception as e:
    print(f"Error creating tables: {e}")
    import traceback
    traceback.print_exc()
