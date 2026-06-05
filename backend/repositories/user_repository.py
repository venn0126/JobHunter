from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(User.email == email))

    def get_by_public_id(self, public_id: str) -> User | None:
        return self.db.scalar(select(User).where(User.public_id == public_id))

    def add(self, user: User) -> User:
        self.db.add(user)
        return user
