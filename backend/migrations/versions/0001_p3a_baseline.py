"""p3a baseline

Revision ID: 0001_p3a_baseline
Revises:
Create Date: 2026-06-04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_p3a_baseline"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "schema_migrations",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("version", sa.Text(), nullable=False, unique=True),
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.execute(
        """
        INSERT INTO schema_migrations(version, applied_at)
        VALUES ('0001_p3a_baseline', now())
        ON CONFLICT (version) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_table("schema_migrations")
