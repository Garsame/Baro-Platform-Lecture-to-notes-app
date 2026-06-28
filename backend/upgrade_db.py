import subprocess
import sys

print("DEPRECATION WARNING: Manual schema upgrades are deprecated.")
print("Running modern database migrations (Alembic) instead...")

try:
    # Run alembic upgrade head using current interpreter
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
    print("Database successfully migrated!")
except subprocess.CalledProcessError as e:
    print(f"Error running database migrations: {e}")
    sys.exit(1)
