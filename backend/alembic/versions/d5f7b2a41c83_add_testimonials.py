"""add testimonials

Revision ID: d5f7b2a41c83
Revises: c3e5a1f09b72
Create Date: 2026-10-22 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5f7b2a41c83'
down_revision: Union[str, Sequence[str], None] = 'c3e5a1f09b72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # main.py runs Base.metadata.create_all at startup, so the table may already exist.
    if "testimonials" in set(sa.inspect(op.get_bind()).get_table_names()):
        return
    op.create_table(
        "testimonials",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("origin", sa.String(length=16), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=120), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("big", sa.String(length=40), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_testimonials_id", "testimonials", ["id"])
    op.create_index("ix_testimonials_status", "testimonials", ["status"])


def downgrade() -> None:
    op.drop_index("ix_testimonials_status", table_name="testimonials")
    op.drop_index("ix_testimonials_id", table_name="testimonials")
    op.drop_table("testimonials")
