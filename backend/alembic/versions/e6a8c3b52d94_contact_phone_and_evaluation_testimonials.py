"""contact phone and evaluation testimonials

Revision ID: e6a8c3b52d94
Revises: d5f7b2a41c83
Create Date: 2026-10-22 15:00:00.000000

"""
from datetime import datetime
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6a8c3b52d94'
down_revision: Union[str, Sequence[str], None] = 'd5f7b2a41c83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Real results from the student evaluation described on the Research page.
EVALUATION_RESULTS = [
    {"big": "5.00 / 5", "name": "Time saved", "role": "All 7 participants gave the top score",
     "text": "Every student in the evaluation rated BaroPlatform 5 out of 5 for the time it saves when revising a lecture."},
    {"big": "4.57 / 5", "name": "Usability", "role": "Student evaluation, 7 participants",
     "text": "Students found the platform easy to use, from submitting a lecture to reading the notes."},
]


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {c["name"] for c in inspector.get_columns("contact_messages")}
    if "phone" not in columns:
        op.add_column("contact_messages", sa.Column("phone", sa.String(length=40), nullable=True))

    testimonials = sa.table(
        "testimonials",
        sa.column("kind", sa.String), sa.column("origin", sa.String), sa.column("name", sa.String),
        sa.column("role", sa.String), sa.column("text", sa.Text), sa.column("big", sa.String),
        sa.column("source", sa.String), sa.column("status", sa.String), sa.column("sort_order", sa.Integer),
        sa.column("created_at", sa.DateTime), sa.column("updated_at", sa.DateTime),
    )
    # Only seed an empty table so an admin's own testimonials are never touched.
    if bind.execute(sa.text("SELECT COUNT(*) FROM testimonials")).scalar() == 0:
        now = datetime.utcnow()
        op.bulk_insert(testimonials, [
            {"kind": "figure", "origin": "admin", "source": "Evaluation", "status": "approved",
             "sort_order": i, "created_at": now, "updated_at": now, **row}
            for i, row in enumerate(EVALUATION_RESULTS)
        ])


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM testimonials WHERE source = 'Evaluation' AND origin = 'admin'"))
    op.drop_column("contact_messages", "phone")
