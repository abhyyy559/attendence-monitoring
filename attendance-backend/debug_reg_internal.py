from app.database import SessionLocal
from app.models.user import User, UserRole
from app.utils.security import get_password_hash
import uuid

def debug_register():
    db = SessionLocal()
    email = f"test_internal_{uuid.uuid4()}@example.com"
    password = "password123"
    print(f"Attempting to register {email}...")

    try:
        hashed_password = get_password_hash(password)
        print("Password hashed.")
        
        db_user = User(
            email=email,
            password_hash=hashed_password,
            role=UserRole.STUDENT,
            full_name="Internal Test",
            phone="1234567890"
        )
        print("User object created.")
        
        db.add(db_user)
        print("User added to session.")
        
        db.commit()
        print("Commit successful!")
        
        db.refresh(db_user)
        print(f"User created with ID: {db_user.user_id}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_register()
