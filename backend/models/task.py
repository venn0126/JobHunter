from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, jsonb_dict_column


class SprintTask(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "sprint_tasks"
    __table_args__ = (
        Index("ix_sprint_tasks_user_persona_status", "user_id", "persona_id", "status"),
        Index("ix_sprint_tasks_due_at", "due_at"),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    task_type: Mapped[str | None] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    priority: Mapped[str | None] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="todo", server_default="todo")
    target_path: Mapped[str | None] = mapped_column(String(255))
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source: Mapped[dict] = jsonb_dict_column()


class InterviewCard(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "interview_cards"
    __table_args__ = (
        Index("ix_interview_cards_user_persona", "user_id", "persona_id"),
        Index("ix_interview_cards_job", "job_id"),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    resume_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("resumes.id", ondelete="SET NULL"))
    job_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("jobs.id", ondelete="SET NULL"))
    card: Mapped[dict] = jsonb_dict_column()
    algorithm_version: Mapped[str | None] = mapped_column(String(120))
    input_hash: Mapped[str | None] = mapped_column(String(120))


class TaskState(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "task_states"
    __table_args__ = (
        UniqueConstraint("task_id", name="uq_task_states_task_id"),
        Index("ix_task_states_user_status", "user_id", "status"),
        Index("ix_task_states_algorithm", "algorithm"),
    )

    task_id: Mapped[str] = mapped_column(String(120), nullable=False)
    user_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    persona_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="SET NULL"))
    algorithm: Mapped[str | None] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="pending", server_default="pending")
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    message: Mapped[str | None] = mapped_column(String(255))
    result_cache_key: Mapped[str | None] = mapped_column(String(255))
    error_code: Mapped[str | None] = mapped_column(String(80))
    payload: Mapped[dict] = jsonb_dict_column()


class TaskEvent(BigIntPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "task_events"
    __table_args__ = (Index("ix_task_events_task_created", "task_state_id", "created_at"),)

    task_state_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("task_states.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(60), nullable=False)
    message: Mapped[str | None] = mapped_column(Text)
    payload: Mapped[dict] = jsonb_dict_column()
