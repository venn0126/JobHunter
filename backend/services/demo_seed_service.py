from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from core.config import get_settings
from core.security import hash_password
from models.persona import Persona
from models.user import User
from repositories.persona_repository import PersonaRepository
from repositories.user_repository import UserRepository
from services.db_tx import commit_or_result
from services.demo_write_state_service import clear_demo_write_state
from services.text_normalization_service import normalize_text_list


def load_demo_personas() -> dict:
    settings = get_settings()
    path = settings.project_root / "frontend" / "src" / "mocks" / "career-personas.json"
    return json.loads(Path(path).read_text(encoding="utf-8"))


def parse_demo_persona_payload(payload: dict) -> tuple[str, list[dict]]:
    personas = payload.get("personas", [])
    if not isinstance(personas, list) or not personas:
        raise ValueError("demo personas seed must contain personas")

    seen_ids: set[str] = set()
    for item in personas:
        if not isinstance(item, dict):
            raise ValueError("demo persona item must be an object")
        public_id = item.get("id")
        name = item.get("name")
        if not isinstance(public_id, str) or not public_id.strip():
            raise ValueError("demo persona id is required")
        if public_id in seen_ids:
            raise ValueError(f"duplicate demo persona id: {public_id}")
        if not isinstance(name, str) or not name.strip():
            raise ValueError(f"demo persona name is required: {public_id}")
        seen_ids.add(public_id)

    active_persona_id = payload.get("active_persona_id")
    if not isinstance(active_persona_id, str) or active_persona_id not in seen_ids:
        raise ValueError("demo active_persona_id must exist in personas")
    return active_persona_id, personas


def seed_demo_identity(db: Session) -> dict:
    settings = get_settings()
    users = UserRepository(db)
    personas = PersonaRepository(db)
    public_id = settings.demo_user_public_id
    email = settings.demo_user_email.strip().lower()

    user = users.get_by_public_id(public_id) or users.get_by_email(email)
    created_user = False
    if not user:
        user = User(
            public_id=public_id,
            email=email,
            password_hash=hash_password(settings.demo_user_password),
            nickname=settings.demo_user_nickname,
            is_demo=True,
        )
        users.add(user)
        created_user = True
    else:
        user.public_id = public_id
        user.email = email
        user.nickname = settings.demo_user_nickname
        user.password_hash = hash_password(settings.demo_user_password)
        user.is_demo = True

    demo_payload = load_demo_personas()
    active_persona_id, seed_personas = parse_demo_persona_payload(demo_payload)

    try:
        db.flush()
    except SQLAlchemyError as exc:
        db.rollback()
        raise RuntimeError(f"demo seed flush failed: {exc}") from exc

    seed_persona_ids = {item["id"] for item in seed_personas}
    existing_by_public_id = {persona.public_id: persona for persona in personas.list_by_user_id(user.id)}
    created_personas = 0
    deleted_personas = personas.delete_by_user_except_public_ids(user.id, seed_persona_ids)

    for sort_order, item in enumerate(seed_personas):
        public_id = item["id"]
        persona = existing_by_public_id.get(public_id)
        if not persona:
            persona = Persona(
                public_id=public_id,
                user_id=user.id,
                name=item["name"],
                target_roles=normalize_text_list(item.get("target_roles", []), limit=20),
                core_skills=normalize_text_list(item.get("core_skills", []), limit=50),
                city_preferences=normalize_text_list(item.get("preferred_cities", []), limit=20),
                salary_expectation=None,
                is_active=public_id == active_persona_id,
                sort_order=sort_order,
            )
            personas.add(persona)
            created_personas += 1
        else:
            persona.name = item["name"]
            persona.target_roles = normalize_text_list(item.get("target_roles", []), limit=20)
            persona.core_skills = normalize_text_list(item.get("core_skills", []), limit=50)
            persona.city_preferences = normalize_text_list(item.get("preferred_cities", []), limit=20)
            persona.salary_expectation = None
            persona.is_active = public_id == active_persona_id
            persona.sort_order = sort_order

    commit_result = commit_or_result(db, conflict_message="demo seed conflict")
    if commit_result.status != "ok":
        raise RuntimeError(commit_result.message or "demo seed failed")
    clear_result = clear_demo_write_state()
    return {
        "user_created": created_user,
        "personas_created": created_personas,
        "personas_deleted": deleted_personas,
        "write_state_cleared": clear_result.data.get("count", 0) if isinstance(clear_result.data, dict) else 0,
        "demo_user_id": user.public_id,
        "active_persona_id": active_persona_id,
    }
