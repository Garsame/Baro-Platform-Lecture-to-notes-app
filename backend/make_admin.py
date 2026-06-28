import sys

print("DEPRECATION WARNING: 'make_admin.py' is deprecated and does not support password hashing or modern databases.")
print("Please use 'manage_admin.py' instead. Examples:")
print("  python manage_admin.py list")
print("  python manage_admin.py create <email> <password> [<full_name>]")
print("  python manage_admin.py promote <email>")
sys.exit(1)
