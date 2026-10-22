"""student account details and pending sign-ups

Revision ID: f7b9d4c63e15
Revises: e6a8c3b52d94
Create Date: 2026-10-23 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7b9d4c63e15'
down_revision: Union[str, Sequence[str], None] = 'e6a8c3b52d94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

USER_COLUMNS = [
    ("university", sa.String(length=120)),
    ("faculty", sa.String(length=120)),
    ("programme", sa.String(length=160)),
    ("year_of_study", sa.String(length=40)),
    ("phone", sa.String(length=40)),
    ("terms_accepted_at", sa.DateTime()),
    ("pending_email", sa.String(length=255)),
    ("pending_email_code", sa.String(length=128)),
    ("pending_email_expires_at", sa.DateTime()),
]


def upgrade() -> None:
    # main.py runs Base.metadata.create_all at startup, so new tables may already exist.
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing = {c["name"] for c in inspector.get_columns("users")}
    for name, type_ in USER_COLUMNS:
        if name not in existing:
            op.add_column("users", sa.Column(name, type_, nullable=True))

    if "pending_email_attempts" not in existing:
        op.add_column("users", sa.Column("pending_email_attempts", sa.Integer(), nullable=False, server_default="0"))

    if "pending_signups" not in set(inspector.get_table_names()):
        op.create_table(
            "pending_signups",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("full_name", sa.String(length=255), nullable=False),
            sa.Column("hashed_password", sa.String(length=255), nullable=False),
            sa.Column("university", sa.String(length=120), nullable=False),
            sa.Column("faculty", sa.String(length=120), nullable=False),
            sa.Column("programme", sa.String(length=160), nullable=False),
            sa.Column("year_of_study", sa.String(length=40), nullable=False),
            sa.Column("phone", sa.String(length=40), nullable=True),
            sa.Column("terms_accepted_at", sa.DateTime(), nullable=False),
            sa.Column("code_hash", sa.String(length=128), nullable=False),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.Column("attempts", sa.Integer(), nullable=False),
            sa.Column("last_sent_at", sa.DateTime(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
        )
        op.create_index("ix_pending_signups_id", "pending_signups", ["id"])
        op.create_index("ix_pending_signups_email", "pending_signups", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_pending_signups_email", table_name="pending_signups")
    op.drop_index("ix_pending_signups_id", table_name="pending_signups")
    op.drop_table("pending_signups")
    op.drop_column("users", "pending_email_attempts")
    for name, _ in reversed(USER_COLUMNS):
        op.drop_column("users", name)
