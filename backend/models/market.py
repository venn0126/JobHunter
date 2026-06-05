from __future__ import annotations

from sqlalchemy import BigInteger, Float, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, jsonb_dict_column, jsonb_list_column


class OpportunityMarketItem(BigIntPrimaryKeyMixin, PublicIdMixin, TimestampMixin, Base):
    __tablename__ = "opportunity_market_items"
    __table_args__ = (
        Index("ix_market_items_type_heat", "item_type", "heat_score"),
        Index("ix_market_items_name", "name"),
    )

    item_type: Mapped[str] = mapped_column(String(40), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    heat_score: Mapped[float | None] = mapped_column(Float)
    growth_score: Mapped[float | None] = mapped_column(Float)
    tags: Mapped[list[str]] = jsonb_list_column()
    filters: Mapped[dict] = jsonb_dict_column()
    source_site: Mapped[str] = mapped_column(String(80), nullable=False, default="mock_seed", server_default="mock_seed")
    source_label: Mapped[str] = mapped_column(String(120), nullable=False, default="Mock 数据", server_default="Mock 数据")
    source_type: Mapped[str] = mapped_column(String(80), nullable=False, default="mock", server_default="mock")
    source_url: Mapped[str | None] = mapped_column(Text)
    source_confidence: Mapped[str] = mapped_column(String(20), nullable=False, default="medium", server_default="medium")


class UserOpportunityPreference(BigIntPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "user_opportunity_preferences"
    __table_args__ = (
        Index("ix_user_market_preferences_user_action", "user_id", "action"),
        Index("ix_user_market_preferences_persona", "persona_id"),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    market_item_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("opportunity_market_items.id", ondelete="CASCADE"),
        nullable=False,
    )
    action: Mapped[str] = mapped_column(String(40), nullable=False)
