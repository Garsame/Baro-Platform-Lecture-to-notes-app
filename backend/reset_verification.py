import sys
import os

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def main():
    db = SessionLocal()
    try:
        result = db.query(User).update({
            User.is_email_verified: False,
            User.otp_code: None,
            User.otp_expires_at: None
        })
        db.commit()
        print(f"Successfully reset {result} users to unverified status in database.")
    except Exception as e:
        print(f"Error resetting user verification: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
