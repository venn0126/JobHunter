from __future__ import annotations

from core.config import get_settings
from core.redis_keys import redis_key
from core.security import generate_token
from services.redis_service import REDIS_RECOVERABLE_ERRORS, run_with_redis
from services.result import ServiceResult


def access_token_key(token: str) -> str:
    return redis_key("auth", "access", token)


def refresh_token_key(token: str) -> str:
    return redis_key("auth", "refresh", token)


class AuthTokenService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def issue(self, user_public_id: str) -> ServiceResult:
        access_token = generate_token("jh_access")
        refresh_token = generate_token("jh_refresh")
        try:
            def store_tokens(client) -> None:
                client.setex(access_token_key(access_token), self.settings.auth_token_ttl_seconds, user_public_id)
                client.setex(refresh_token_key(refresh_token), self.settings.auth_refresh_token_ttl_seconds, user_public_id)

            run_with_redis(store_tokens)
        except REDIS_RECOVERABLE_ERRORS as exc:
            return ServiceResult(status="degraded", message=str(exc))

        return ServiceResult(
            status="ok",
            data={
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "tokenType": "bearer",
                "expiresIn": self.settings.auth_token_ttl_seconds,
            },
        )

    def read_access_user_id(self, token: str | None) -> ServiceResult:
        if not token:
            return ServiceResult(status="unauthorized", message="missing access token")
        try:
            user_public_id = run_with_redis(lambda client: client.get(access_token_key(token)))
        except REDIS_RECOVERABLE_ERRORS as exc:
            return ServiceResult(status="degraded", message=str(exc))
        if not user_public_id:
            return ServiceResult(status="unauthorized", message="invalid access token")
        return ServiceResult(status="ok", data=user_public_id)

    def read_refresh_user_id(self, token: str | None) -> ServiceResult:
        if not token:
            return ServiceResult(status="unauthorized", message="missing refresh token")
        try:
            user_public_id = run_with_redis(lambda client: client.get(refresh_token_key(token)))
        except REDIS_RECOVERABLE_ERRORS as exc:
            return ServiceResult(status="degraded", message=str(exc))
        if not user_public_id:
            return ServiceResult(status="unauthorized", message="invalid refresh token")
        return ServiceResult(status="ok", data=user_public_id)

    def revoke(self, *, access_token: str | None = None, refresh_token: str | None = None) -> ServiceResult:
        if not access_token and not refresh_token:
            return ServiceResult(status="ok")

        try:
            def delete_tokens(client) -> None:
                keys = []
                if access_token:
                    keys.append(access_token_key(access_token))
                if refresh_token:
                    keys.append(refresh_token_key(refresh_token))
                if keys:
                    client.delete(*keys)

            run_with_redis(delete_tokens)
        except REDIS_RECOVERABLE_ERRORS as exc:
            return ServiceResult(status="degraded", message=str(exc))

        return ServiceResult(status="ok")
