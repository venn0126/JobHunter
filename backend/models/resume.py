from __future__ import annotations

from sqlalchemy import BigInteger, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, jsonb_dict_column, jsonb_list_column


class CareerVaultItem(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "career_vault_items"
    __table_args__ = (
        Index("ix_career_vault_user_persona", "user_id", "persona_id"),
        Index("ix_career_vault_item_type", "item_type"),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    item_type: Mapped[str] = mapped_column(String(40), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str]] = jsonb_list_column()
    evidence: Mapped[dict] = jsonb_dict_column()


class Resume(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "resumes"
    __table_args__ = (Index("ix_resumes_user", "user_id"),)

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename: Mapped[str | None] = mapped_column(String(255))
    file_path: Mapped[str | None] = mapped_column(Text)
    content_type: Mapped[str | None] = mapped_column(String(120))
    raw_text: Mapped[str | None] = mapped_column(Text)


class ResumeProfile(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "resume_profiles"
    __table_args__ = (Index("ix_resume_profiles_user_persona", "user_id", "persona_id"),)

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    resume_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("resumes.id", ondelete="CASCADE"))
    profile: Mapped[dict] = jsonb_dict_column()


class ResumeVersion(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "resume_versions"
    __table_args__ = (Index("ix_resume_versions_user_persona", "user_id", "persona_id"),)

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    resume_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("resumes.id", ondelete="SET NULL"))
    source_job_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("jobs.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    content: Mapped[str | None] = mapped_column(Text)
    sections: Mapped[list[dict]] = jsonb_list_column()


class ResumeVersionMetric(BigIntPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "resume_version_metrics"
    __table_args__ = (Index("ix_resume_version_metrics_user_persona", "user_id", "persona_id"),)

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    resume_version_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("resume_versions.id", ondelete="CASCADE"),
        nullable=False,
    )
    applied_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    interview_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    no_response_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    rejected_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    offer_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    metrics: Mapped[dict] = jsonb_dict_column()
