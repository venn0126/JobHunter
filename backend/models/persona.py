from __future__ import annotations

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin


class Persona(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "personas"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_personas_user_name"),)

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    target_roles: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list, server_default="[]")
    core_skills: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list, server_default="[]")
    city_preferences: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list, server_default="[]")
    salary_expectation: Mapped[str | None] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    user = relationship("User", back_populates="personas")
