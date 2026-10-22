"""Adds columns that newer code expects but an older database does not have yet.

Alembic stays the proper way to migrate. This only protects against the common
mistake of pulling new code and starting the server before running the migration,
which otherwise ends in "no such column" errors. It never drops or changes anything.
"""
import logging

from sqlalchemy import inspect, text

logger = logging.getLogger("somali_notes.schema")

# table -> {column: SQL type}
EXPECTED = {
    "users": {
        "university": "VARCHAR(255)",
        "faculty": "VARCHAR(255)",
        "programme": "VARCHAR(255)",
        "year_of_study": "VARCHAR(64)",
        "phone": "VARCHAR(32)",
        "terms_accepted_at": "TIMESTAMP",
        "pending_email": "VARCHAR(255)",
        "pending_email_code": "VARCHAR(128)",
        "pending_email_expires_at": "TIMESTAMP",
        "pending_email_attempts": "INTEGER DEFAULT 0",
    },
    "contact_messages": {
        "phone": "VARCHAR(40)",
    },
}


def ensure_columns(engine) -> None:
    insp = inspect(engine)
    for table, columns in EXPECTED.items():
        if not insp.has_table(table):
            continue
        have = {c["name"] for c in insp.get_columns(table)}
        for name, sql_type in columns.items():
            if name in have:
                continue
            try:
                with engine.begin() as conn:
                    conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {name} {sql_type}'))
                logger.warning("Added missing column %s.%s. Run the Alembic migration too.", table, name)
            except Exception:
                logger.exception("Could not add column %s.%s", table, name)
