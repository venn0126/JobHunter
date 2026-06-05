from __future__ import annotations

from datetime import datetime, timezone

from redis.exceptions import RedisError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.config import get_settings
from core.ids import avatar_text, new_public_id
from core.redis_keys import redis_key
from core.security import generate_token, hash_password, verify_password
from models.user import User
from repositories.user_repository import UserRepository
from services.redis_service import run_with_redis
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


def token_key(token: str) -> str:
    return redis_key("auth", "access", token)


def refresh_token_key(token: str) -> str:
    return redis_key("auth", "refresh", token)


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.settings = get_settings()

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
        try:
            self.users.add(user)
            session_result = self.issue_session(user)
            if session_result.status != "ok":
                self.db.rollback()
                return session_result
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            return ServiceResult(status="conflict", message="email already registered")

        return session_result

    def login(self, *, email: str, password: str) -> ServiceResult:
        user = self.users.get_by_email(normalize_email(email))
        if not user or not verify_password(password, user.password_hash):
            return ServiceResult(status="invalid", message="invalid email or password")
        return self.issue_session(user)

    def refresh(self, refresh_token: str | None) -> ServiceResult:
        if not refresh_token:
            return ServiceResult(status="unauthorized", message="missing refresh token")

        try:
            user_public_id = run_with_redis(lambda client: client.get(refresh_token_key(refresh_token)))
        except RedisError as exc:
            return ServiceResult(status="degraded", message=str(exc))

        if not user_public_id:
            return ServiceResult(status="unauthorized", message="invalid refresh token")

        user = self.users.get_by_public_id(user_public_id)
        if not user:
            return ServiceResult(status="unauthorized", message="user not found")
        return self.issue_session(user)

    def logout(self, access_token: str | None, refresh_token: str | None = None) -> ServiceResult:
        tokens = [token for token in (access_token, refresh_token) if token]
        if not tokens:
            return ServiceResult(status="ok")

        try:
            def delete_tokens(client) -> None:
                keys = []
                if access_token:
                    keys.append(token_key(access_token))
                if refresh_token:
                    keys.append(refresh_token_key(refresh_token))
                if keys:
                    client.delete(*keys)

            run_with_redis(delete_tokens)
            return ServiceResult(status="ok")
        except RedisError as exc:
            return ServiceResult(status="degraded", message=str(exc))

    def get_user_by_token(self, token: str | None) -> ServiceResult:
        if not token:
            return ServiceResult(status="unauthorized", message="missing access token")

        try:
            user_public_id = run_with_redis(lambda client: client.get(token_key(token)))
        except RedisError as exc:
            return ServiceResult(status="degraded", message=str(exc))

        if not user_public_id:
            return ServiceResult(status="unauthorized", message="invalid access token")

        user = self.users.get_by_public_id(user_public_id)
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

        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            return ServiceResult(status="conflict", message="email already registered")

        return ServiceResult(status="ok", data=serialize_user(user))

    def issue_session(self, user: User) -> ServiceResult:
        access_token = generate_token("jh_access")
        refresh_token = generate_token("jh_refresh")
        try:
            def store_tokens(client) -> None:
                issued_at = datetime.now(timezone.utc).isoformat()
                client.setex(token_key(access_token), self.settings.auth_token_ttl_seconds, user.public_id)
                client.setex(refresh_token_key(refresh_token), self.settings.auth_refresh_token_ttl_seconds, user.public_id)
                client.hset(redis_key("auth", "meta", access_token), mapping={"issued_at": issued_at})
                client.expire(redis_key("auth", "meta", access_token), self.settings.auth_token_ttl_seconds)

            run_with_redis(store_tokens)
        except RedisError as exc:
            return ServiceResult(status="degraded", message=str(exc))

        return ServiceResult(
            status="ok",
            data={
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "tokenType": "bearer",
                "expiresIn": self.settings.auth_token_ttl_seconds,
                "user": serialize_user(user),
            },
        )
