from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, jsonb_list_column


class JobSourceRecord(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "job_source_records"
    __table_args__ = (
        UniqueConstraint("source_id", "external_job_id", name="uq_job_source_records_source_external"),
        UniqueConstraint("dedupe_key", name="uq_job_source_records_dedupe_key"),
        Index("ix_job_source_records_status_updated", "status", "updated_at"),
        Index("ix_job_source_records_batch", "batch_id"),
    )

    external_job_id: Mapped[str | None] = mapped_column(String(120))
    source_id: Mapped[str] = mapped_column(String(160), nullable=False)
    source_name: Mapped[str | None] = mapped_column(String(160))
    source_type: Mapped[str] = mapped_column(String(80), nullable=False)
    fetch_method: Mapped[str | None] = mapped_column(String(80))
    fetch_url: Mapped[str | None] = mapped_column(Text)
    origin_url: Mapped[str | None] = mapped_column(Text)
    apply_url: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="unknown", server_default="unknown", index=True)
    confidence: Mapped[float | None] = mapped_column(Float)
    dedupe_key: Mapped[str] = mapped_column(String(120), nullable=False)
    batch_id: Mapped[str | None] = mapped_column(String(180))
    raw_payload: Mapped[dict | None] = mapped_column(JSONB)
    raw_html: Mapped[str | None] = mapped_column(Text)
    raw_markdown: Mapped[str | None] = mapped_column(Text)
    crawled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    job = relationship("Job", back_populates="source_record", uselist=False)


class Job(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "jobs"
    __table_args__ = (
        Index("ix_jobs_status_city", "status", "city"),
        Index("ix_jobs_role_direction", "role_direction"),
        Index("ix_jobs_company", "company"),
        Index("ix_jobs_publish_time", "publish_time"),
        Index("ix_jobs_source", "source_site", "source_type"),
    )

    source_record_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("job_source_records.id", ondelete="SET NULL"),
        unique=True,
    )
    external_job_id: Mapped[str | None] = mapped_column(String(120))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_title: Mapped[str | None] = mapped_column(String(255))
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str | None] = mapped_column(String(255))
    business_group: Mapped[str | None] = mapped_column(String(255))
    city: Mapped[str | None] = mapped_column(String(120), index=True)
    locations: Mapped[list[str]] = jsonb_list_column()
    country: Mapped[str | None] = mapped_column(String(40))
    workplace_type: Mapped[str] = mapped_column(String(40), nullable=False, default="unknown", server_default="unknown")
    job_type: Mapped[str | None] = mapped_column(String(80))
    employment_type: Mapped[str | None] = mapped_column(String(80))
    job_category: Mapped[str | None] = mapped_column(String(120))
    role_direction: Mapped[str | None] = mapped_column(String(120))
    role_family: Mapped[str | None] = mapped_column(String(120))
    seniority: Mapped[str | None] = mapped_column(String(80))
    education: Mapped[str | None] = mapped_column(String(80))
    experience: Mapped[str | None] = mapped_column(String(120))
    experience_min_years: Mapped[int | None] = mapped_column(Integer)
    salary: Mapped[str | None] = mapped_column(String(120))
    salary_min: Mapped[int | None] = mapped_column(Integer)
    salary_max: Mapped[int | None] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)
    responsibilities: Mapped[list[str]] = jsonb_list_column()
    requirements: Mapped[list[str]] = jsonb_list_column()
    skills: Mapped[list[str]] = jsonb_list_column()
    keywords: Mapped[list[str]] = jsonb_list_column()
    language: Mapped[str | None] = mapped_column(String(40))
    headcount: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="unknown", server_default="unknown", index=True)
    confidence: Mapped[float | None] = mapped_column(Float)
    source_id: Mapped[str] = mapped_column(String(160), nullable=False)
    source_site: Mapped[str] = mapped_column(String(80), nullable=False)
    source_name: Mapped[str | None] = mapped_column(String(160))
    source_type: Mapped[str] = mapped_column(String(80), nullable=False)
    source_label: Mapped[str | None] = mapped_column(String(120))
    source_url: Mapped[str | None] = mapped_column(Text)
    fetch_method: Mapped[str | None] = mapped_column(String(80))
    fetch_url: Mapped[str | None] = mapped_column(Text)
    origin_url: Mapped[str | None] = mapped_column(Text)
    apply_url: Mapped[str | None] = mapped_column(Text)
    dedupe_key: Mapped[str | None] = mapped_column(String(120), index=True)
    embedding_text: Mapped[str | None] = mapped_column(Text)
    publish_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expire_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    crawled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    source_record = relationship("JobSourceRecord", back_populates="job")
