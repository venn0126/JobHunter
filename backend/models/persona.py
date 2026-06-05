from __future__ import annotations

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, jsonb_list_column


class Persona(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "personas"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_personas_user_name"),)

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    target_roles: Mapped[list[str]] = jsonb_list_column()
    core_skills: Mapped[list[str]] = jsonb_list_column()
    city_preferences: Mapped[list[str]] = jsonb_list_column()
    salary_expectation: Mapped[str | None] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    user = relationship("User", back_populates="personas")
