from typing import Any, Literal

from pydantic import BaseModel, Field

PipelineStatus = Literal["interested", "tailored", "applied", "hr_contact", "interviewing", "offer", "rejected", "withdrawn"]
VaultItemType = Literal["project", "skill", "story", "certificate"]
FeedbackOutcome = Literal["applied", "interview", "no_response", "offer", "rejected", "withdrawn"]


class PipelineCardCreateRequest(BaseModel):
    job_id: str = Field(min_length=1, max_length=120)
    status: PipelineStatus = "interested"
    next_action: str | None = Field(default=None, max_length=255)


class PipelineCardUpdateRequest(BaseModel):
    status: PipelineStatus | None = None
    next_action: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=2000)


class StarEvidenceRequest(BaseModel):
    situation: str = ""
    task: str = ""
    action: str = ""
    result: str = ""


class VaultItemCreateRequest(BaseModel):
    type: VaultItemType
    title: str = Field(min_length=1, max_length=255)
    summary: str = Field(default="", max_length=2000)
    tags: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    impact: str = Field(default="", max_length=2000)
    star: StarEvidenceRequest = Field(default_factory=StarEvidenceRequest)


class VaultItemUpdateRequest(BaseModel):
    type: VaultItemType | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    summary: str | None = Field(default=None, max_length=2000)
    tags: list[str] | None = None
    skills: list[str] | None = None
    impact: str | None = Field(default=None, max_length=2000)
    star: StarEvidenceRequest | None = None


class FeedbackUpsertRequest(BaseModel):
    job_id: str = Field(min_length=1, max_length=120)
    resume_version_id: str = Field(min_length=1, max_length=120)
    outcome: FeedbackOutcome
    notes: str = Field(default="", max_length=4000)
    next_action: str = Field(default="", max_length=255)
    feedback_tags: list[str] = Field(default_factory=list)


class FeedbackPatchRequest(BaseModel):
    outcome: FeedbackOutcome | None = None
    notes: str | None = Field(default=None, max_length=4000)
    next_action: str | None = Field(default=None, max_length=255)
    feedback_tags: list[str] | None = None


class ResumeVersionCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    job_id: str | None = Field(default=None, max_length=120)
    sections: list[dict[str, Any]] = Field(default_factory=list)
    content: str | None = Field(default=None, max_length=20000)
