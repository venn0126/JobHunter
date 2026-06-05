from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, BigIntPrimaryKeyMixin, TimestampMixin


class SystemVersion(BigIntPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "system_versions"
    __table_args__ = (Index("ix_system_versions_version", "version"),)

    version: Mapped[str] = mapped_column(String(80), nullable=False)
    git_commit: Mapped[str | None] = mapped_column(String(80))
    frontend_hash: Mapped[str | None] = mapped_column(String(120))
    backend_hash: Mapped[str | None] = mapped_column(String(120))
    build_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    message: Mapped[str | None] = mapped_column(Text)


class UpdateJob(BigIntPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "update_jobs"
    __table_args__ = (Index("ix_update_jobs_user_status", "user_id", "status"),)

    user_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="pending", server_default="pending")
    from_version: Mapped[str | None] = mapped_column(String(80))
    to_version: Mapped[str | None] = mapped_column(String(80))
    log: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
