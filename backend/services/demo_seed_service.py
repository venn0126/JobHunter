from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy.orm import Session

from core.config import get_settings
from core.security import hash_password
from models.persona import Persona
from models.user import User
from repositories.persona_repository import PersonaRepository
from repositories.user_repository import UserRepository
from services.db_tx import commit_or_result
from services.persona_service import normalize_text_list


def load_demo_personas() -> dict:
    settings = get_settings()
    path = settings.project_root / "frontend" / "src" / "mocks" / "career-personas.json"
    return json.loads(Path(path).read_text(encoding="utf-8"))


def seed_demo_identity(db: Session) -> dict:
    settings = get_settings()
    users = UserRepository(db)
    personas = PersonaRepository(db)
    email = settings.demo_user_email.strip().lower()

    user = users.get_by_email(email)
    created_user = False
    if not user:
        user = User(
            public_id="demo_user",
            email=email,
            password_hash=hash_password(settings.demo_user_password),
            nickname=settings.demo_user_nickname,
            is_demo=True,
        )
        users.add(user)
        created_user = True
    else:
        user.nickname = settings.demo_user_nickname
        user.password_hash = hash_password(settings.demo_user_password)
        user.is_demo = True

    demo_payload = load_demo_personas()
    existing_by_public_id = {persona.public_id: persona for persona in personas.list_by_user_id(user.id)}
    active_persona_id = demo_payload.get("active_persona_id")
    created_personas = 0

    for sort_order, item in enumerate(demo_payload.get("personas", [])):
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
    return {
        "user_created": created_user,
        "personas_created": created_personas,
        "demo_user_id": user.public_id,
        "active_persona_id": active_persona_id,
    }
