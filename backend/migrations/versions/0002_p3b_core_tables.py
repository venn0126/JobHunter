"""p3b core business tables

Revision ID: 0002_p3b_core_tables
Revises: 0001_p3a_baseline
Create Date: 2026-06-05
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002_p3b_core_tables"
down_revision: Union[str, None] = "0001_p3a_baseline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

JSONB_EMPTY_OBJECT = sa.text("'{}'::jsonb")
JSONB_EMPTY_ARRAY = sa.text("'[]'::jsonb")
NOW = sa.text("now()")


def timestamp_columns() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
    ]


def public_id_column() -> sa.Column:
    return sa.Column("public_id", sa.String(length=80), nullable=False)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("nickname", sa.String(length=80), nullable=False),
        sa.Column("direction", sa.String(length=120)),
        sa.Column("target_city", sa.String(length=120)),
        sa.Column("avatar_url", sa.Text()),
        sa.Column("is_demo", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        *timestamp_columns(),
        sa.UniqueConstraint("email", name="uq_users_email"),
        sa.UniqueConstraint("public_id", name="uq_users_public_id"),
    )

    op.create_table(
        "personas",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("target_roles", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("core_skills", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("city_preferences", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("salary_expectation", sa.String(length=80)),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_personas_public_id"),
        sa.UniqueConstraint("user_id", "name", name="uq_personas_user_name"),
    )
    op.create_index("ix_personas_user_id", "personas", ["user_id"])

    op.create_table(
        "job_source_records",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("external_job_id", sa.String(length=120)),
        sa.Column("source_id", sa.String(length=160), nullable=False),
        sa.Column("source_name", sa.String(length=160)),
        sa.Column("source_type", sa.String(length=80), nullable=False),
        sa.Column("fetch_method", sa.String(length=80)),
        sa.Column("fetch_url", sa.Text()),
        sa.Column("origin_url", sa.Text()),
        sa.Column("apply_url", sa.Text()),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="unknown"),
        sa.Column("confidence", sa.Float()),
        sa.Column("dedupe_key", sa.String(length=120), nullable=False),
        sa.Column("batch_id", sa.String(length=180)),
        sa.Column("raw_payload", postgresql.JSONB()),
        sa.Column("raw_html", sa.Text()),
        sa.Column("raw_markdown", sa.Text()),
        sa.Column("crawled_at", sa.DateTime(timezone=True)),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_job_source_records_public_id"),
        sa.UniqueConstraint("source_id", "external_job_id", name="uq_job_source_records_source_external"),
        sa.UniqueConstraint("dedupe_key", name="uq_job_source_records_dedupe_key"),
    )
    op.create_index("ix_job_source_records_status", "job_source_records", ["status"])
    op.create_index("ix_job_source_records_status_updated", "job_source_records", ["status", "updated_at"])
    op.create_index("ix_job_source_records_batch", "job_source_records", ["batch_id"])

    op.create_table(
        "jobs",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("source_record_id", sa.BigInteger(), sa.ForeignKey("job_source_records.id", ondelete="SET NULL")),
        sa.Column("external_job_id", sa.String(length=120)),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("normalized_title", sa.String(length=255)),
        sa.Column("company", sa.String(length=255), nullable=False),
        sa.Column("department", sa.String(length=255)),
        sa.Column("business_group", sa.String(length=255)),
        sa.Column("city", sa.String(length=120)),
        sa.Column("locations", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("country", sa.String(length=40)),
        sa.Column("workplace_type", sa.String(length=40), nullable=False, server_default="unknown"),
        sa.Column("job_type", sa.String(length=80)),
        sa.Column("employment_type", sa.String(length=80)),
        sa.Column("job_category", sa.String(length=120)),
        sa.Column("role_direction", sa.String(length=120)),
        sa.Column("role_family", sa.String(length=120)),
        sa.Column("seniority", sa.String(length=80)),
        sa.Column("education", sa.String(length=80)),
        sa.Column("experience", sa.String(length=120)),
        sa.Column("experience_min_years", sa.Integer()),
        sa.Column("salary", sa.String(length=120)),
        sa.Column("salary_min", sa.Integer()),
        sa.Column("salary_max", sa.Integer()),
        sa.Column("description", sa.Text()),
        sa.Column("responsibilities", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("requirements", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("skills", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("keywords", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("language", sa.String(length=40)),
        sa.Column("headcount", sa.Integer()),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="unknown"),
        sa.Column("confidence", sa.Float()),
        sa.Column("source_id", sa.String(length=160), nullable=False),
        sa.Column("source_site", sa.String(length=80), nullable=False),
        sa.Column("source_name", sa.String(length=160)),
        sa.Column("source_type", sa.String(length=80), nullable=False),
        sa.Column("source_label", sa.String(length=120)),
        sa.Column("source_url", sa.Text()),
        sa.Column("fetch_method", sa.String(length=80)),
        sa.Column("fetch_url", sa.Text()),
        sa.Column("origin_url", sa.Text()),
        sa.Column("apply_url", sa.Text()),
        sa.Column("dedupe_key", sa.String(length=120)),
        sa.Column("embedding_text", sa.Text()),
        sa.Column("publish_time", sa.DateTime(timezone=True)),
        sa.Column("expire_time", sa.DateTime(timezone=True)),
        sa.Column("crawled_at", sa.DateTime(timezone=True)),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_jobs_public_id"),
        sa.UniqueConstraint("source_record_id", name="uq_jobs_source_record_id"),
    )
    op.create_index("ix_jobs_city", "jobs", ["city"])
    op.create_index("ix_jobs_status", "jobs", ["status"])
    op.create_index("ix_jobs_dedupe_key", "jobs", ["dedupe_key"])
    op.create_index("ix_jobs_status_city", "jobs", ["status", "city"])
    op.create_index("ix_jobs_role_direction", "jobs", ["role_direction"])
    op.create_index("ix_jobs_company", "jobs", ["company"])
    op.create_index("ix_jobs_publish_time", "jobs", ["publish_time"])
    op.create_index("ix_jobs_source", "jobs", ["source_site", "source_type"])

    op.create_table(
        "opportunity_market_items",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("item_type", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("heat_score", sa.Float()),
        sa.Column("growth_score", sa.Float()),
        sa.Column("tags", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("filters", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        sa.Column("source_site", sa.String(length=80), nullable=False, server_default="mock_seed"),
        sa.Column("source_label", sa.String(length=120), nullable=False, server_default="Mock 数据"),
        sa.Column("source_type", sa.String(length=80), nullable=False, server_default="mock"),
        sa.Column("source_url", sa.Text()),
        sa.Column("source_confidence", sa.String(length=20), nullable=False, server_default="medium"),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_opportunity_market_items_public_id"),
    )
    op.create_index("ix_market_items_type_heat", "opportunity_market_items", ["item_type", "heat_score"])
    op.create_index("ix_market_items_name", "opportunity_market_items", ["name"])

    op.create_table(
        "user_opportunity_preferences",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("market_item_id", sa.BigInteger(), sa.ForeignKey("opportunity_market_items.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action", sa.String(length=40), nullable=False),
        *timestamp_columns(),
    )
    op.create_index("ix_user_market_preferences_user_action", "user_opportunity_preferences", ["user_id", "action"])
    op.create_index("ix_user_market_preferences_persona", "user_opportunity_preferences", ["persona_id"])

    op.create_table(
        "career_vault_items",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("item_type", sa.String(length=40), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text()),
        sa.Column("tags", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        sa.Column("evidence", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_career_vault_items_public_id"),
    )
    op.create_index("ix_career_vault_user_persona", "career_vault_items", ["user_id", "persona_id"])
    op.create_index("ix_career_vault_item_type", "career_vault_items", ["item_type"])

    op.create_table(
        "resumes",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(length=255)),
        sa.Column("file_path", sa.Text()),
        sa.Column("content_type", sa.String(length=120)),
        sa.Column("raw_text", sa.Text()),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_resumes_public_id"),
    )
    op.create_index("ix_resumes_user", "resumes", ["user_id"])

    op.create_table(
        "resume_profiles",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.BigInteger(), sa.ForeignKey("resumes.id", ondelete="CASCADE")),
        sa.Column("profile", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_resume_profiles_public_id"),
    )
    op.create_index("ix_resume_profiles_user_persona", "resume_profiles", ["user_id", "persona_id"])

    op.create_table(
        "resume_versions",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.BigInteger(), sa.ForeignKey("resumes.id", ondelete="SET NULL")),
        sa.Column("source_job_id", sa.BigInteger(), sa.ForeignKey("jobs.id", ondelete="SET NULL")),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("content", sa.Text()),
        sa.Column("sections", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_ARRAY),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_resume_versions_public_id"),
    )
    op.create_index("ix_resume_versions_user_persona", "resume_versions", ["user_id", "persona_id"])

    op.create_table(
        "resume_version_metrics",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_version_id", sa.BigInteger(), sa.ForeignKey("resume_versions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("applied_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("interview_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("no_response_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("rejected_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("offer_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("metrics", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        *timestamp_columns(),
    )
    op.create_index("ix_resume_version_metrics_user_persona", "resume_version_metrics", ["user_id", "persona_id"])

    op.create_table(
        "job_decision_cards",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.BigInteger(), sa.ForeignKey("resumes.id", ondelete="SET NULL")),
        sa.Column("job_id", sa.BigInteger(), sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("decision", sa.String(length=40), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column("overall_grade", sa.String(length=40)),
        sa.Column("scores", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        sa.Column("detail", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        sa.Column("algorithm_version", sa.String(length=120)),
        sa.Column("input_hash", sa.String(length=120)),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_job_decision_cards_public_id"),
    )
    op.create_index("ix_job_decisions_user_persona", "job_decision_cards", ["user_id", "persona_id"])
    op.create_index("ix_job_decisions_job", "job_decision_cards", ["job_id"])
    op.create_index("ix_job_decisions_priority", "job_decision_cards", ["priority"])

    op.create_table(
        "recruiter_lens_reports",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", sa.BigInteger(), sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("report", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        sa.Column("algorithm_version", sa.String(length=120)),
        sa.Column("input_hash", sa.String(length=120)),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_recruiter_lens_reports_public_id"),
    )
    op.create_index("ix_recruiter_lens_user_persona", "recruiter_lens_reports", ["user_id", "persona_id"])
    op.create_index("ix_recruiter_lens_job", "recruiter_lens_reports", ["job_id"])

    op.create_table(
        "pipeline_cards",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", sa.BigInteger(), sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_version_id", sa.BigInteger(), sa.ForeignKey("resume_versions.id", ondelete="SET NULL")),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("next_step", sa.String(length=255)),
        sa.Column("reminder_at", sa.DateTime(timezone=True)),
        sa.Column("notes", sa.Text()),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_pipeline_cards_public_id"),
        sa.UniqueConstraint("user_id", "persona_id", "job_id", name="uq_pipeline_cards_user_persona_job"),
    )
    op.create_index("ix_pipeline_cards_user_status", "pipeline_cards", ["user_id", "status"])
    op.create_index("ix_pipeline_cards_persona", "pipeline_cards", ["persona_id"])

    op.create_table(
        "tailor_outputs",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.BigInteger(), sa.ForeignKey("resumes.id", ondelete="SET NULL")),
        sa.Column("job_id", sa.BigInteger(), sa.ForeignKey("jobs.id", ondelete="SET NULL")),
        sa.Column("output", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        sa.Column("algorithm_version", sa.String(length=120)),
        sa.Column("input_hash", sa.String(length=120)),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_tailor_outputs_public_id"),
    )
    op.create_index("ix_tailor_outputs_user_persona", "tailor_outputs", ["user_id", "persona_id"])
    op.create_index("ix_tailor_outputs_job", "tailor_outputs", ["job_id"])

    op.create_table(
        "application_feedback",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", sa.BigInteger(), sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("pipeline_card_id", sa.BigInteger(), sa.ForeignKey("pipeline_cards.id", ondelete="SET NULL")),
        sa.Column("resume_version_id", sa.BigInteger(), sa.ForeignKey("resume_versions.id", ondelete="SET NULL")),
        sa.Column("result", sa.String(length=40), nullable=False),
        sa.Column("reason", sa.String(length=160)),
        sa.Column("note", sa.Text()),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_application_feedback_public_id"),
    )
    op.create_index("ix_application_feedback_user_persona", "application_feedback", ["user_id", "persona_id"])
    op.create_index("ix_application_feedback_job", "application_feedback", ["job_id"])
    op.create_index("ix_application_feedback_result", "application_feedback", ["result"])

    op.create_table(
        "sprint_tasks",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("task_type", sa.String(length=40)),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("priority", sa.String(length=20)),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="todo"),
        sa.Column("target_path", sa.String(length=255)),
        sa.Column("due_at", sa.DateTime(timezone=True)),
        sa.Column("source", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_sprint_tasks_public_id"),
    )
    op.create_index("ix_sprint_tasks_user_persona_status", "sprint_tasks", ["user_id", "persona_id", "status"])
    op.create_index("ix_sprint_tasks_due_at", "sprint_tasks", ["due_at"])

    op.create_table(
        "interview_cards",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.BigInteger(), sa.ForeignKey("resumes.id", ondelete="SET NULL")),
        sa.Column("job_id", sa.BigInteger(), sa.ForeignKey("jobs.id", ondelete="SET NULL")),
        sa.Column("card", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        sa.Column("algorithm_version", sa.String(length=120)),
        sa.Column("input_hash", sa.String(length=120)),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_interview_cards_public_id"),
    )
    op.create_index("ix_interview_cards_user_persona", "interview_cards", ["user_id", "persona_id"])
    op.create_index("ix_interview_cards_job", "interview_cards", ["job_id"])

    op.create_table(
        "task_states",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        public_id_column(),
        sa.Column("task_id", sa.String(length=120), nullable=False),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("persona_id", sa.BigInteger(), sa.ForeignKey("personas.id", ondelete="SET NULL")),
        sa.Column("algorithm", sa.String(length=80)),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="pending"),
        sa.Column("progress", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("message", sa.String(length=255)),
        sa.Column("result_cache_key", sa.String(length=255)),
        sa.Column("error_code", sa.String(length=80)),
        sa.Column("payload", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        *timestamp_columns(),
        sa.UniqueConstraint("public_id", name="uq_task_states_public_id"),
        sa.UniqueConstraint("task_id", name="uq_task_states_task_id"),
    )
    op.create_index("ix_task_states_user_status", "task_states", ["user_id", "status"])
    op.create_index("ix_task_states_algorithm", "task_states", ["algorithm"])

    op.create_table(
        "task_events",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("task_state_id", sa.BigInteger(), sa.ForeignKey("task_states.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(length=60), nullable=False),
        sa.Column("message", sa.Text()),
        sa.Column("payload", postgresql.JSONB(), nullable=False, server_default=JSONB_EMPTY_OBJECT),
        *timestamp_columns(),
    )
    op.create_index("ix_task_events_task_created", "task_events", ["task_state_id", "created_at"])

    op.create_table(
        "system_versions",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("version", sa.String(length=80), nullable=False),
        sa.Column("git_commit", sa.String(length=80)),
        sa.Column("frontend_hash", sa.String(length=120)),
        sa.Column("backend_hash", sa.String(length=120)),
        sa.Column("build_time", sa.DateTime(timezone=True)),
        sa.Column("message", sa.Text()),
        *timestamp_columns(),
    )
    op.create_index("ix_system_versions_version", "system_versions", ["version"])

    op.create_table(
        "update_jobs",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="pending"),
        sa.Column("from_version", sa.String(length=80)),
        sa.Column("to_version", sa.String(length=80)),
        sa.Column("log", sa.Text()),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("finished_at", sa.DateTime(timezone=True)),
        *timestamp_columns(),
    )
    op.create_index("ix_update_jobs_user_status", "update_jobs", ["user_id", "status"])

    op.execute(
        """
        INSERT INTO schema_migrations(version, applied_at)
        VALUES ('0002_p3b_core_tables', now())
        ON CONFLICT (version) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_index("ix_update_jobs_user_status", table_name="update_jobs")
    op.drop_table("update_jobs")

    op.drop_index("ix_system_versions_version", table_name="system_versions")
    op.drop_table("system_versions")

    op.drop_index("ix_task_events_task_created", table_name="task_events")
    op.drop_table("task_events")

    op.drop_index("ix_task_states_algorithm", table_name="task_states")
    op.drop_index("ix_task_states_user_status", table_name="task_states")
    op.drop_table("task_states")

    op.drop_index("ix_interview_cards_job", table_name="interview_cards")
    op.drop_index("ix_interview_cards_user_persona", table_name="interview_cards")
    op.drop_table("interview_cards")

    op.drop_index("ix_sprint_tasks_due_at", table_name="sprint_tasks")
    op.drop_index("ix_sprint_tasks_user_persona_status", table_name="sprint_tasks")
    op.drop_table("sprint_tasks")

    op.drop_index("ix_application_feedback_result", table_name="application_feedback")
    op.drop_index("ix_application_feedback_job", table_name="application_feedback")
    op.drop_index("ix_application_feedback_user_persona", table_name="application_feedback")
    op.drop_table("application_feedback")

    op.drop_index("ix_tailor_outputs_job", table_name="tailor_outputs")
    op.drop_index("ix_tailor_outputs_user_persona", table_name="tailor_outputs")
    op.drop_table("tailor_outputs")

    op.drop_index("ix_pipeline_cards_persona", table_name="pipeline_cards")
    op.drop_index("ix_pipeline_cards_user_status", table_name="pipeline_cards")
    op.drop_table("pipeline_cards")

    op.drop_index("ix_recruiter_lens_job", table_name="recruiter_lens_reports")
    op.drop_index("ix_recruiter_lens_user_persona", table_name="recruiter_lens_reports")
    op.drop_table("recruiter_lens_reports")

    op.drop_index("ix_job_decisions_priority", table_name="job_decision_cards")
    op.drop_index("ix_job_decisions_job", table_name="job_decision_cards")
    op.drop_index("ix_job_decisions_user_persona", table_name="job_decision_cards")
    op.drop_table("job_decision_cards")

    op.drop_index("ix_resume_version_metrics_user_persona", table_name="resume_version_metrics")
    op.drop_table("resume_version_metrics")

    op.drop_index("ix_resume_versions_user_persona", table_name="resume_versions")
    op.drop_table("resume_versions")

    op.drop_index("ix_resume_profiles_user_persona", table_name="resume_profiles")
    op.drop_table("resume_profiles")

    op.drop_index("ix_resumes_user", table_name="resumes")
    op.drop_table("resumes")

    op.drop_index("ix_career_vault_item_type", table_name="career_vault_items")
    op.drop_index("ix_career_vault_user_persona", table_name="career_vault_items")
    op.drop_table("career_vault_items")

    op.drop_index("ix_user_market_preferences_persona", table_name="user_opportunity_preferences")
    op.drop_index("ix_user_market_preferences_user_action", table_name="user_opportunity_preferences")
    op.drop_table("user_opportunity_preferences")

    op.drop_index("ix_market_items_name", table_name="opportunity_market_items")
    op.drop_index("ix_market_items_type_heat", table_name="opportunity_market_items")
    op.drop_table("opportunity_market_items")

    op.drop_index("ix_jobs_source", table_name="jobs")
    op.drop_index("ix_jobs_publish_time", table_name="jobs")
    op.drop_index("ix_jobs_company", table_name="jobs")
    op.drop_index("ix_jobs_role_direction", table_name="jobs")
    op.drop_index("ix_jobs_status_city", table_name="jobs")
    op.drop_index("ix_jobs_dedupe_key", table_name="jobs")
    op.drop_index("ix_jobs_status", table_name="jobs")
    op.drop_index("ix_jobs_city", table_name="jobs")
    op.drop_table("jobs")

    op.drop_index("ix_job_source_records_batch", table_name="job_source_records")
    op.drop_index("ix_job_source_records_status_updated", table_name="job_source_records")
    op.drop_index("ix_job_source_records_status", table_name="job_source_records")
    op.drop_table("job_source_records")

    op.drop_index("ix_personas_user_id", table_name="personas")
    op.drop_table("personas")

    op.drop_table("users")
