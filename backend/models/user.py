from __future__ import annotations

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin


class User(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    nickname: Mapped[str] = mapped_column(String(80), nullable=False)
    direction: Mapped[str | None] = mapped_column(String(120))
    target_city: Mapped[str | None] = mapped_column(String(120))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    personas = relationship("Persona", back_populates="user", cascade="all, delete-orphan")
