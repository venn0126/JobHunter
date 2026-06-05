from __future__ import annotations

import secrets


def new_public_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_hex(8)}"


def avatar_text(name: str) -> str:
    normalized = name.strip()
    if not normalized:
        return "JH"
    return normalized[:2].upper()
