import sys
import os

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base

def main():
    db = SessionLocal()
    try:
        # Get all table metadata
        metadata = Base.metadata
        # Clear database tables (reversed list to handle dependencies first)
        for table in reversed(metadata.sorted_tables):
            try:
                db.execute(table.delete())
                print(f"Wiped table: {table.name}")
            except Exception as e:
                print(f"Error wiping table {table.name}: {e}")
        db.commit()
        print('All user and lecture data wiped perfectly.')
    except Exception as e:
        print(f"Error during database wipe: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
