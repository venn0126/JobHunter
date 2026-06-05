from __future__ import annotations

from sqlalchemy.orm import Session

from core.ids import new_public_id
from models.persona import Persona
from models.user import User
from repositories.persona_repository import PersonaRepository
from services.db_tx import commit_or_result
from services.result import ServiceResult


def normalize_text_list(items: list[str] | None, *, limit: int = 50) -> list[str]:
    if not items:
        return []

    normalized: list[str] = []
    seen: set[str] = set()
    for item in items:
        text = item.strip()
        if not text or text in seen:
            continue
        normalized.append(text)
        seen.add(text)
        if len(normalized) >= limit:
            break
    return normalized


def serialize_persona(persona: Persona) -> dict:
    return {
        "id": persona.public_id,
        "name": persona.name,
        "target_roles": persona.target_roles,
        "core_skills": persona.core_skills,
        "preferred_cities": persona.city_preferences,
        "status": "active",
        "is_active": persona.is_active,
    }


def serialize_persona_list(personas: list[Persona]) -> dict:
    active_persona = next((persona for persona in personas if persona.is_active), None)
    return {
        "active_persona_id": active_persona.public_id if active_persona else None,
        "personas": [serialize_persona(persona) for persona in personas],
    }


class PersonaService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.personas = PersonaRepository(db)

    def list_personas(self, user: User) -> ServiceResult:
        return ServiceResult(status="ok", data=serialize_persona_list(self.personas.list_by_user_id(user.id)))

    def create_persona(
        self,
        user: User,
        *,
        name: str,
        target_roles: list[str],
        core_skills: list[str],
        preferred_cities: list[str],
        salary_expectation: str | None = None,
    ) -> ServiceResult:
        normalized_name = name.strip()
        if not normalized_name:
            return ServiceResult(status="invalid", message="persona name is required")

        existing_personas = self.personas.list_by_user_id(user.id)
        persona = Persona(
            public_id=new_public_id("persona"),
            user_id=user.id,
            name=normalized_name,
            target_roles=normalize_text_list(target_roles, limit=20),
            core_skills=normalize_text_list(core_skills, limit=50),
            city_preferences=normalize_text_list(preferred_cities, limit=20),
            salary_expectation=salary_expectation.strip() if salary_expectation else None,
            is_active=not existing_personas,
            sort_order=len(existing_personas),
        )

        self.personas.add(persona)
        commit_result = commit_or_result(self.db, conflict_message="persona name already exists")
        if commit_result.status != "ok":
            return commit_result

        return ServiceResult(status="created", data=serialize_persona(persona))

    def update_persona(
        self,
        user: User,
        public_id: str,
        *,
        name: str | None = None,
        target_roles: list[str] | None = None,
        core_skills: list[str] | None = None,
        preferred_cities: list[str] | None = None,
        salary_expectation: str | None = None,
        status: str | None = None,
    ) -> ServiceResult:
        persona = self.personas.get_by_public_id(user.id, public_id)
        if not persona:
            return ServiceResult(status="miss", message="persona not found")

        if name is not None:
            normalized_name = name.strip()
            if not normalized_name:
                return ServiceResult(status="invalid", message="persona name is required")
            persona.name = normalized_name
        if target_roles is not None:
            persona.target_roles = normalize_text_list(target_roles, limit=20)
        if core_skills is not None:
            persona.core_skills = normalize_text_list(core_skills, limit=50)
        if preferred_cities is not None:
            persona.city_preferences = normalize_text_list(preferred_cities, limit=20)
        if salary_expectation is not None:
            persona.salary_expectation = salary_expectation.strip() or None
        if status is not None and status != "active":
            return ServiceResult(status="invalid", message="archive persona is not supported yet")

        commit_result = commit_or_result(self.db, conflict_message="persona name already exists")
        if commit_result.status != "ok":
            return commit_result

        return ServiceResult(status="ok", data=serialize_persona(persona))

    def activate_persona(self, user: User, public_id: str) -> ServiceResult:
        persona = self.personas.get_by_public_id(user.id, public_id)
        if not persona:
            return ServiceResult(status="miss", message="persona not found")

        self.personas.clear_active(user.id)
        persona.is_active = True
        commit_result = commit_or_result(self.db, conflict_message="persona activation conflict")
        if commit_result.status != "ok":
            return commit_result
        return ServiceResult(status="ok", data=serialize_persona_list(self.personas.list_by_user_id(user.id)))
