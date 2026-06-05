from __future__ import annotations

from sqlalchemy import BigInteger, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, jsonb_dict_column


class JobDecisionCard(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "job_decision_cards"
    __table_args__ = (
        Index("ix_job_decisions_user_persona", "user_id", "persona_id"),
        Index("ix_job_decisions_job", "job_id"),
        Index("ix_job_decisions_priority", "priority"),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    resume_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("resumes.id", ondelete="SET NULL"))
    job_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    decision: Mapped[str] = mapped_column(String(40), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    overall_grade: Mapped[str | None] = mapped_column(String(40))
    scores: Mapped[dict] = jsonb_dict_column()
    detail: Mapped[dict] = jsonb_dict_column()
    algorithm_version: Mapped[str | None] = mapped_column(String(120))
    input_hash: Mapped[str | None] = mapped_column(String(120))


class RecruiterLensReport(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "recruiter_lens_reports"
    __table_args__ = (
        Index("ix_recruiter_lens_user_persona", "user_id", "persona_id"),
        Index("ix_recruiter_lens_job", "job_id"),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    report: Mapped[dict] = jsonb_dict_column()
    algorithm_version: Mapped[str | None] = mapped_column(String(120))
    input_hash: Mapped[str | None] = mapped_column(String(120))


class TailorOutput(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "tailor_outputs"
    __table_args__ = (
        Index("ix_tailor_outputs_user_persona", "user_id", "persona_id"),
        Index("ix_tailor_outputs_job", "job_id"),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    resume_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("resumes.id", ondelete="SET NULL"))
    job_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("jobs.id", ondelete="SET NULL"))
    output: Mapped[dict] = jsonb_dict_column()
    algorithm_version: Mapped[str | None] = mapped_column(String(120))
    input_hash: Mapped[str | None] = mapped_column(String(120))
