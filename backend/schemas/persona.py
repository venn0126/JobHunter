from typing import Literal

from pydantic import BaseModel, Field

PersonaStatus = Literal["active", "archived"]


class PersonaResponse(BaseModel):
    id: str
    name: str
    target_roles: list[str] = Field(default_factory=list)
    core_skills: list[str] = Field(default_factory=list)
    preferred_cities: list[str] = Field(default_factory=list)
    status: PersonaStatus = "active"
    is_active: bool = False


class PersonaListResponse(BaseModel):
    active_persona_id: str | None = None
    personas: list[PersonaResponse] = Field(default_factory=list)


class PersonaCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    target_roles: list[str] = Field(default_factory=list, max_length=20)
    core_skills: list[str] = Field(default_factory=list, max_length=50)
    preferred_cities: list[str] = Field(default_factory=list, max_length=20)
    salary_expectation: str | None = Field(default=None, max_length=80)


class PersonaUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    target_roles: list[str] | None = Field(default=None, max_length=20)
    core_skills: list[str] | None = Field(default=None, max_length=50)
    preferred_cities: list[str] | None = Field(default=None, max_length=20)
    salary_expectation: str | None = Field(default=None, max_length=80)
    status: PersonaStatus | None = None
