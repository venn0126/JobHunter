from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin


class PipelineCard(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "pipeline_cards"
    __table_args__ = (
        UniqueConstraint("user_id", "persona_id", "job_id", name="uq_pipeline_cards_user_persona_job"),
        Index("ix_pipeline_cards_user_status", "user_id", "status"),
        Index("ix_pipeline_cards_persona", "persona_id"),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    resume_version_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("resume_versions.id", ondelete="SET NULL"))
    status: Mapped[str] = mapped_column(String(40), nullable=False)
    next_step: Mapped[str | None] = mapped_column(String(255))
    reminder_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)


class ApplicationFeedback(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "application_feedback"
    __table_args__ = (
        Index("ix_application_feedback_user_persona", "user_id", "persona_id"),
        Index("ix_application_feedback_job", "job_id"),
        Index("ix_application_feedback_result", "result"),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    pipeline_card_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("pipeline_cards.id", ondelete="SET NULL"))
    resume_version_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("resume_versions.id", ondelete="SET NULL"))
    result: Mapped[str] = mapped_column(String(40), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(160))
    note: Mapped[str | None] = mapped_column(Text)
