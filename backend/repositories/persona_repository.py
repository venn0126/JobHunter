from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from models.persona import Persona


class PersonaRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_user_id(self, user_id: int) -> list[Persona]:
        return list(
            self.db.scalars(
                select(Persona).where(Persona.user_id == user_id).order_by(Persona.sort_order.asc(), Persona.id.asc())
            )
        )

    def get_by_public_id(self, user_id: int, public_id: str) -> Persona | None:
        return self.db.scalar(select(Persona).where(Persona.user_id == user_id, Persona.public_id == public_id))

    def add(self, persona: Persona) -> Persona:
        self.db.add(persona)
        return persona

    def clear_active(self, user_id: int) -> None:
        for persona in self.db.scalars(select(Persona).where(Persona.user_id == user_id, Persona.is_active.is_(True))):
            persona.is_active = False

    def delete_by_user_except_public_ids(self, user_id: int, public_ids: set[str]) -> int:
        result = self.db.execute(
            delete(Persona).where(Persona.user_id == user_id, Persona.public_id.not_in(public_ids))
        )
        return result.rowcount or 0
