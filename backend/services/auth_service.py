from __future__ import annotations

from sqlalchemy.orm import Session

from core.ids import avatar_text, new_public_id
from core.security import hash_password, verify_password
from models.user import User
from repositories.user_repository import UserRepository
from services.auth_token_service import AuthTokenService
from services.db_tx import commit_or_result
from services.result import ServiceResult


def normalize_email(email: str) -> str:
    return email.strip().lower()


def is_valid_email(email: str) -> bool:
    return "@" in email and "." in email.rsplit("@", 1)[-1]


def serialize_user(user: User) -> dict:
    return {
        "id": user.public_id,
        "name": user.nickname,
        "email": user.email,
        "avatarText": avatar_text(user.nickname),
        "isDemo": user.is_demo,
        "direction": user.direction,
        "targetCity": user.target_city,
    }


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.tokens = AuthTokenService()

    def register(self, *, name: str, email: str, password: str) -> ServiceResult:
        normalized_email = normalize_email(email)
        normalized_name = name.strip()
        if not normalized_name:
            return ServiceResult(status="invalid", message="nickname is required")
        if not is_valid_email(normalized_email):
            return ServiceResult(status="invalid", message="invalid email")
        if self.users.get_by_email(normalized_email):
            return ServiceResult(status="conflict", message="email already registered")

        user = User(
            public_id=new_public_id("user"),
            email=normalized_email,
            password_hash=hash_password(password),
            nickname=normalized_name,
            is_demo=False,
        )
        session_result: ServiceResult | None = None
        self.users.add(user)
        session_result = self.issue_session(user)
        if session_result.status != "ok":
            self.db.rollback()
            return session_result

        commit_result = commit_or_result(self.db, conflict_message="email already registered")
        if commit_result.status != "ok":
            self.tokens.revoke(
                access_token=session_result.data.get("accessToken"),
                refresh_token=session_result.data.get("refreshToken"),
            )
            return commit_result

        return session_result

    def login(self, *, email: str, password: str) -> ServiceResult:
        user = self.users.get_by_email(normalize_email(email))
        if not user or not verify_password(password, user.password_hash):
            return ServiceResult(status="invalid", message="invalid email or password")
        return self.issue_session(user)

    def refresh(self, refresh_token: str | None) -> ServiceResult:
        if not refresh_token:
            return ServiceResult(status="unauthorized", message="missing refresh token")

        token_result = self.tokens.read_refresh_user_id(refresh_token)
        if token_result.status != "ok":
            return token_result

        user = self.users.get_by_public_id(token_result.data)
        if not user:
            return ServiceResult(status="unauthorized", message="user not found")
        return self.issue_session(user)

    def logout(self, access_token: str | None, refresh_token: str | None = None) -> ServiceResult:
        return self.tokens.revoke(access_token=access_token, refresh_token=refresh_token)

    def get_user_by_token(self, token: str | None) -> ServiceResult:
        token_result = self.tokens.read_access_user_id(token)
        if token_result.status != "ok":
            return token_result

        user = self.users.get_by_public_id(token_result.data)
        if not user:
            return ServiceResult(status="unauthorized", message="user not found")
        return ServiceResult(status="ok", data=user)

    def update_me(
        self,
        user: User,
        *,
        name: str | None = None,
        email: str | None = None,
        direction: str | None = None,
        target_city: str | None = None,
    ) -> ServiceResult:
        if name is not None:
            normalized_name = name.strip()
            if not normalized_name:
                return ServiceResult(status="invalid", message="nickname is required")
            user.nickname = normalized_name

        if email is not None:
            normalized_email = normalize_email(email)
            if not is_valid_email(normalized_email):
                return ServiceResult(status="invalid", message="invalid email")
            existing_user = self.users.get_by_email(normalized_email)
            if existing_user and existing_user.id != user.id:
                return ServiceResult(status="conflict", message="email already registered")
            user.email = normalized_email

        if direction is not None:
            user.direction = direction.strip() or None
        if target_city is not None:
            user.target_city = target_city.strip() or None

        commit_result = commit_or_result(self.db, conflict_message="email already registered")
        if commit_result.status != "ok":
            return commit_result

        return ServiceResult(status="ok", data=serialize_user(user))

    def issue_session(self, user: User) -> ServiceResult:
        token_result = self.tokens.issue(user.public_id)
        if token_result.status != "ok":
            return token_result
        return ServiceResult(status="ok", data={**token_result.data, "user": serialize_user(user)})
