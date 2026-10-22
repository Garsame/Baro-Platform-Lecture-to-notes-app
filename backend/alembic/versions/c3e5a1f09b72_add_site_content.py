"""add site content tables

Revision ID: c3e5a1f09b72
Revises: dad0d187c0fc
Create Date: 2026-10-22 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3e5a1f09b72'
down_revision: Union[str, Sequence[str], None] = 'dad0d187c0fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # main.py runs Base.metadata.create_all at startup, so the tables may already exist.
    existing = set(sa.inspect(op.get_bind()).get_table_names())

    if "site_settings" not in existing:
        op.create_table(
            "site_settings",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("key", sa.String(length=64), nullable=False),
            sa.Column("value", sa.JSON(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        )
        op.create_index("ix_site_settings_id", "site_settings", ["id"])
        op.create_index("ix_site_settings_key", "site_settings", ["key"], unique=True)

    if "site_assets" not in existing:
        op.create_table(
            "site_assets",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("kind", sa.String(length=16), nullable=False),
            sa.Column("url", sa.String(length=500), nullable=False, unique=True),
            sa.Column("original_name", sa.String(length=255), nullable=False),
            sa.Column("content_type", sa.String(length=100), nullable=False),
            sa.Column("size_bytes", sa.BigInteger(), nullable=False),
            sa.Column("alt_text", sa.String(length=255), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("uploaded_by_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        )
        op.create_index("ix_site_assets_id", "site_assets", ["id"])


def downgrade() -> None:
    op.drop_index("ix_site_assets_id", table_name="site_assets")
    op.drop_table("site_assets")
    op.drop_index("ix_site_settings_key", table_name="site_settings")
    op.drop_index("ix_site_settings_id", table_name="site_settings")
    op.drop_table("site_settings")
