from __future__ import annotations

import re
from dataclasses import dataclass
from time import perf_counter
from typing import Any, Callable, Literal

from core.config import get_settings
from core.redis_keys import cache_key, input_hash
from services.cache_service import RedisJsonCache
from services.demo_dataset_service import read_demo_dataset, read_demo_items
from services.job_query_service import get_demo_job
from services.pagination_service import paginate_items
from services.result import ServiceResult
from services.task_state_service import RedisTaskStateStore, TaskStatus, build_task_state, utc_now

GeneratedSource = Literal["mock", "fallback_mock"]
ResponseSource = Literal["cache", "mock", "fallback_mock", "fallback_cache"]

GENERATED_CACHE_VERSION = "mock_v1"
DEFAULT_PERSONA_ID = "persona_ai_app"


@dataclass(frozen=True)
class GeneratedPayload:
    result: dict[str, Any]
    source: GeneratedSource


GenerationFactory = Callable[[], GeneratedPayload]


def safe_task_part(value: Any) -> str:
    normalized = re.sub(r"[^A-Za-z0-9_.:-]+", "_", str(value).strip())
    return (normalized or "_")[:48]


def generation_task_id(scope: str, target_id: str, payload_hash: str) -> str:
    return f"task_{safe_task_part(scope)}_{safe_task_part(target_id)}_{payload_hash}"


def active_demo_identity() -> tuple[str, str]:
    settings = get_settings()
    try:
        payload = read_demo_dataset("careerPersonas")
        persona_id = payload.get("active_persona_id") if isinstance(payload, dict) else None
    except (FileNotFoundError, ValueError):
        persona_id = None
    return settings.demo_user_public_id, persona_id or DEFAULT_PERSONA_ID


def cached_result_payload(result: dict[str, Any], source: GeneratedSource) -> dict[str, Any]:
    return {
        "result": result,
        "origin_source": source,
        "cached_at": utc_now(),
    }


def unwrap_cached_result(payload: Any) -> tuple[dict[str, Any], str | None]:
    if isinstance(payload, dict) and isinstance(payload.get("result"), dict):
        origin_source = payload.get("origin_source")
        return payload["result"], origin_source if isinstance(origin_source, str) else None
    if isinstance(payload, dict):
        return payload, None
    raise ValueError("cached generated payload must be an object")


def generated_response(
    *,
    task_id: str,
    task_status: TaskStatus,
    source: ResponseSource,
    result: dict[str, Any],
    scope: str,
    target_id: str,
    payload_hash: str,
    result_cache_key: str,
    cache_status: str,
    origin_source: str | None = None,
    warnings: list[str] | None = None,
) -> dict[str, Any]:
    settings = get_settings()
    return {
        "task_id": task_id,
        "status": task_status,
        "source": source,
        "result": result,
        "cache": {
            "key": result_cache_key,
            "status": cache_status,
            "ttl_seconds": settings.generated_cache_ttl_seconds,
        },
        "generation": {
            "scope": scope,
            "target_id": target_id,
            "payload_hash": payload_hash,
            "version": GENERATED_CACHE_VERSION,
            "origin_source": origin_source or source,
            "warnings": warnings or [],
        },
    }


class GeneratedContentService:
    def __init__(self) -> None:
        settings = get_settings()
        self.cache = RedisJsonCache(ttl_seconds=settings.generated_cache_ttl_seconds)
        self.task_store = RedisTaskStateStore(ttl_seconds=settings.task_state_ttl_seconds)

    def get_or_generate(
        self,
        *,
        scope: str,
        target_id: str,
        payload: dict[str, Any],
        factory: GenerationFactory,
        force_refresh: bool = False,
    ) -> ServiceResult:
        user_id, persona_id = active_demo_identity()
        payload_hash = input_hash(payload)
        result_cache_key = cache_key(scope, user_id, persona_id, target_id, GENERATED_CACHE_VERSION, payload_hash)
        latest_cache_key = cache_key(scope, user_id, persona_id, target_id, GENERATED_CACHE_VERSION, "latest")
        task_id = generation_task_id(scope, target_id, payload_hash)

        self._set_task(task_id, "running", 10, "generation started", result_cache_key, {"source": "request"})
        self.task_store.append_event(task_id, "started", "generation started", {"scope": scope, "target_id": target_id})

        warnings: list[str] = []
        stale_result: dict[str, Any] | None = None
        stale_source: str | None = None
        stale_cache_key = result_cache_key
        cache_read = self.cache.get(result_cache_key)
        if cache_read.status == "hit":
            try:
                stale_result, stale_source = unwrap_cached_result(cache_read.data)
                if not force_refresh:
                    response = generated_response(
                        task_id=task_id,
                        task_status="succeeded",
                        source="cache",
                        result=stale_result,
                        scope=scope,
                        target_id=target_id,
                        payload_hash=payload_hash,
                        result_cache_key=result_cache_key,
                        cache_status="hit",
                        origin_source=stale_source,
                    )
                    self._complete_task(task_id, "succeeded", "cache hit", result_cache_key, response)
                    self.task_store.append_event(task_id, "cache_hit", "generated result reused from cache")
                    return ServiceResult(status="ok", data=response)
            except ValueError as exc:
                warnings.append(str(exc))
                self.task_store.append_event(task_id, "cache_invalid", "cached result ignored", {"message": str(exc)})

        if cache_read.status == "degraded":
            warnings.append(cache_read.message or "redis cache unavailable")
            self.task_store.append_event(task_id, "cache_degraded", "cache read degraded", {"message": cache_read.message})
        elif cache_read.status == "miss":
            latest_cache_read = self.cache.get(latest_cache_key)
            if latest_cache_read.status == "hit":
                try:
                    stale_result, stale_source = unwrap_cached_result(latest_cache_read.data)
                    stale_cache_key = latest_cache_key
                except ValueError as exc:
                    warnings.append(str(exc))
                    self.task_store.append_event(task_id, "cache_invalid", "latest cached result ignored", {"message": str(exc)})
            elif latest_cache_read.status == "degraded":
                warnings.append(latest_cache_read.message or "redis cache unavailable")
                self.task_store.append_event(
                    task_id,
                    "cache_degraded",
                    "latest cache read degraded",
                    {"message": latest_cache_read.message},
                )

        try:
            started_at = perf_counter()
            generated = factory()
            elapsed_seconds = perf_counter() - started_at
            timeout_seconds = get_settings().generated_timeout_seconds
            if elapsed_seconds > timeout_seconds:
                raise TimeoutError(f"generation timeout after {elapsed_seconds:.2f}s")
        except Exception as exc:
            if stale_result is not None:
                response = generated_response(
                    task_id=task_id,
                    task_status="fallback_cache",
                    source="fallback_cache",
                    result=stale_result,
                    scope=scope,
                    target_id=target_id,
                    payload_hash=payload_hash,
                    result_cache_key=stale_cache_key,
                    cache_status="hit",
                    origin_source=stale_source,
                    warnings=[*warnings, str(exc)],
                )
                self._complete_task(task_id, "fallback_cache", "generation failed, fallback to cache", stale_cache_key, response)
                self.task_store.append_event(task_id, "fallback_cache", "generation failed, fallback to previous cache", {"error": str(exc)})
                return ServiceResult(status="ok", data=response)
            self._set_task(task_id, "failed", 100, "generation failed", result_cache_key, {"error": str(exc)})
            self.task_store.append_event(task_id, "failed", "generation failed", {"error": str(exc)})
            return ServiceResult(status="failed", message=str(exc))

        cache_payload = cached_result_payload(generated.result, generated.source)
        cache_write = self.cache.set(result_cache_key, cache_payload)
        latest_cache_write = self.cache.set(latest_cache_key, cache_payload)
        if cache_write.status == "degraded":
            warnings.append(cache_write.message or "redis cache unavailable")
            self.task_store.append_event(task_id, "cache_degraded", "cache write degraded", {"message": cache_write.message})
        if latest_cache_write.status == "degraded" and latest_cache_write.message != cache_write.message:
            warnings.append(latest_cache_write.message or "redis cache unavailable")
            self.task_store.append_event(task_id, "cache_degraded", "latest cache write degraded", {"message": latest_cache_write.message})

        task_status: TaskStatus = (
            "fallback_mock"
            if cache_read.status == "degraded" or cache_write.status == "degraded" or latest_cache_write.status == "degraded"
            else "succeeded"
        )
        response = generated_response(
            task_id=task_id,
            task_status=task_status,
            source=generated.source,
            result=generated.result,
            scope=scope,
            target_id=target_id,
            payload_hash=payload_hash,
            result_cache_key=result_cache_key,
            cache_status=cache_write.status,
            warnings=warnings,
        )
        self._complete_task(task_id, task_status, "generation completed", result_cache_key, response)
        self.task_store.append_event(task_id, "generated", "generated result stored", {"cache_status": cache_write.status})
        return ServiceResult(status="ok", data=response)

    def decision_card(self, job_id: str, *, force_refresh: bool = False) -> ServiceResult:
        job = get_demo_job(job_id)
        if not job:
            return ServiceResult(status="miss", message="job not found")
        return self.get_or_generate(
            scope="job_decision",
            target_id=job_id,
            payload={"job": job, "operation": "decision"},
            factory=lambda: build_decision_card(job),
            force_refresh=force_refresh,
        )

    def recruiter_lens(self, job_id: str, *, force_refresh: bool = False) -> ServiceResult:
        job = get_demo_job(job_id)
        if not job:
            return ServiceResult(status="miss", message="job not found")
        return self.get_or_generate(
            scope="recruiter_lens",
            target_id=job_id,
            payload={"job": job, "operation": "recruiter_lens"},
            factory=lambda: build_recruiter_lens(job),
            force_refresh=force_refresh,
        )

    def decision_list(self, *, page: int = 1, page_size: int = 20, force_refresh: bool = False) -> ServiceResult:
        jobs = read_demo_items("jobs")
        return self.get_or_generate(
            scope="decision_list",
            target_id="all",
            payload={
                "job_ids": [job.get("id") for job in jobs],
                "operation": "decision_list",
                "page": page,
                "page_size": page_size,
            },
            factory=lambda: build_decision_list(jobs, page=page, page_size=page_size),
            force_refresh=force_refresh,
        )

    def tailored_resume(self, job_id: str, *, force_refresh: bool = False) -> ServiceResult:
        job = get_demo_job(job_id)
        if not job:
            return ServiceResult(status="miss", message="job not found")
        return self.get_or_generate(
            scope="tailored_resume",
            target_id=job_id,
            payload={"job": job, "operation": "tailor"},
            factory=lambda: build_tailored_resume(job),
            force_refresh=force_refresh,
        )

    def interview_guide(self, job_id: str, *, force_refresh: bool = False) -> ServiceResult:
        job = get_demo_job(job_id)
        if not job:
            return ServiceResult(status="miss", message="job not found")
        return self.get_or_generate(
            scope="interview_guide",
            target_id=job_id,
            payload={"job": job, "operation": "interview"},
            factory=lambda: build_interview_guide(job),
            force_refresh=force_refresh,
        )

    def _set_task(
        self,
        task_id: str,
        status: TaskStatus,
        progress: int,
        message: str,
        result_cache_key: str,
        payload: dict[str, Any],
    ) -> None:
        self.task_store.set_state(
            build_task_state(
                task_id=task_id,
                status=status,
                progress=progress,
                message=message,
                result_cache_key=result_cache_key,
                payload=payload,
            )
        )

    def _complete_task(
        self,
        task_id: str,
        status: TaskStatus,
        message: str,
        result_cache_key: str,
        response: dict[str, Any],
    ) -> None:
        self._set_task(
            task_id,
            status,
            100,
            message,
            result_cache_key,
            {
                "source": response["source"],
                "cache_status": response["cache"]["status"],
                "result": response["result"],
            },
        )


def find_by_job_id(dataset_key: str, job_id: str) -> dict[str, Any] | None:
    return next((item for item in read_demo_items(dataset_key) if item.get("job_id") == job_id), None)


def build_decision_card(job: dict[str, Any]) -> GeneratedPayload:
    existing = find_by_job_id("decisionCards", job["id"])
    if existing:
        return GeneratedPayload(result=existing, source="mock")

    match = int(job.get("match", 0) or 0)
    result = {
        "job_id": job["id"],
        "decision": "推荐" if match >= 85 else "观望",
        "priority": job.get("priority", "P1"),
        "overall_grade": "A-" if match >= 85 else "B",
        "scores": {
            "match": match,
            "job_quality": 78,
            "growth": 76,
            "salary": 70,
            "competition_risk": 60,
            "apply_cost": 40,
        },
        "hit_reasons": [
            "岗位方向与当前求职身份存在交集。",
            "岗位信息来自 Demo 兜底生成，页面结构可稳定演示。",
            "后续算法接口接入后可替换为真实决策结果。",
        ],
        "gaps": [{"evidence_id": "ev_missing", "text": "当前岗位暂无完整证据链，建议补充职业素材后重新分析。"}],
        "risks": [
            {
                "type": "数据不足",
                "evidence_id": "ev_missing",
                "level": "中",
                "text": "决策数据使用 Demo 兜底，解释深度有限。",
                "fix_action": "补充职业素材库",
            }
        ],
        "next_actions": [
            {"label": "加入求职管线", "target_path": "/pipeline"},
            {"label": "补充职业素材", "target_path": "/resume"},
            {"label": "准备面试作战卡", "target_path": f"/interview?job={job['id']}"},
        ],
    }
    return GeneratedPayload(result=result, source="fallback_mock")


def build_recruiter_lens(job: dict[str, Any]) -> GeneratedPayload:
    existing = find_by_job_id("recruiterLens", job["id"])
    if existing:
        return GeneratedPayload(result=existing, source="mock")

    result = {
        "job_id": job["id"],
        "first_impression": "招聘官会优先查看岗位关键词、项目证据和最近经历是否匹配。",
        "highlights": ["方向相关", "具备可迁移项目经验", "适合进入进一步评估"],
        "concerns": ["证据链不足", "量化结果不够", "岗位细节需要进一步确认"],
        "likely_questions": ["你为什么适合这个岗位？", "最能证明能力的项目是什么？", "你如何补齐岗位短板？"],
        "improve_tips": ["补充项目证据", "突出量化成果", "准备岗位相关案例"],
    }
    return GeneratedPayload(result=result, source="fallback_mock")


def build_decision_list(jobs: list[dict[str, Any]], *, page: int = 1, page_size: int = 20) -> GeneratedPayload:
    generated_items = [build_decision_card(job) for job in jobs]
    source: GeneratedSource = "fallback_mock" if any(item.source == "fallback_mock" for item in generated_items) else "mock"
    return GeneratedPayload(result=paginate_items([item.result for item in generated_items], page=page, page_size=page_size), source=source)


def build_tailored_resume(job: dict[str, Any]) -> GeneratedPayload:
    existing = find_by_job_id("resumeStudio", job["id"])
    if existing:
        return GeneratedPayload(result=existing, source="mock")

    title = job.get("title", "目标岗位")
    company = job.get("company", "目标公司")
    direction = job.get("direction", title)
    result = {
        "job_id": job["id"],
        "job_title": title,
        "company": company,
        "keywords": [direction, title, "岗位关键词", "项目证据", "结果量化"],
        "summary": {
            "target_role": title,
            "readiness": "1 条可直接使用，2 条建议补充",
            "ready_sections": 1,
            "needs_evidence": 2,
        },
        "sections": [
            {
                "id": "sec_role_match",
                "section": "岗位匹配",
                "before": "具备相关项目经验和业务理解。",
                "after": f"围绕{direction}方向沉淀项目交付经验，可结合岗位要求快速完成业务场景拆解、方案设计和结果复盘。",
                "reason": "优先补齐岗位方向与个人经历之间的显性匹配。",
                "evidence": [
                    {
                        "source_type": "career_vault_project",
                        "source_id": "ev_rag_project",
                        "quote": "具备项目交付和结果复盘经验。",
                    }
                ],
                "status": "可直接使用",
            },
            {
                "id": "sec_quantify_gap",
                "section": "量化成果",
                "before": "",
                "after": "建议补充与岗位直接相关的规模、效率、收入、转化率或稳定性指标。",
                "reason": "当前岗位需要更明确的结果证明，避免只描述职责。",
                "evidence": [],
                "missing_evidence_id": "ev_missing_metrics",
                "status": "建议补充",
            },
            {
                "id": "sec_business_story",
                "section": "业务场景",
                "before": "",
                "after": f"建议补充一个与{company}业务场景相近的 STAR 案例，用于解释问题识别、方案推进和协作结果。",
                "reason": "招聘方通常会追问候选人与业务目标的连接能力。",
                "evidence": [],
                "missing_evidence_id": "ev_missing_business_story",
                "status": "建议补充",
            },
        ],
    }
    return GeneratedPayload(result=result, source="fallback_mock")


def build_interview_guide(job: dict[str, Any]) -> GeneratedPayload:
    existing = find_by_job_id("interviewGuide", job["id"])
    if existing:
        return GeneratedPayload(result=existing, source="mock")

    title = job.get("title", "目标岗位")
    company = job.get("company", "目标公司")
    direction = job.get("direction", title)
    result = {
        "job_id": job["id"],
        "company_brief": {
            "business": f"{company}的岗位信息来自 Demo 数据，建议结合官网和 JD 继续补充业务背景。",
            "role_focus": f"本岗位重点围绕{direction}、项目证据和结果量化展开。",
            "interview_style": "先使用通用项目深挖模板准备面试，后续可由算法接口补齐公司画像。",
        },
        "interview_focus": ["梳理岗位关键词", "准备项目证据", "复盘简历风险"],
        "questions": [
            {
                "id": "iq_role_match",
                "question": f"你为什么适合{title}这个岗位？",
                "intent": "验证候选人是否理解岗位要求，并能用证据证明匹配度。",
                "framework": [
                    "先用一句话概括岗位核心要求。",
                    "再连接 1-2 段项目或业务证据。",
                    "最后说明入职后前三个月能交付什么。",
                ],
                "evidence_ids": ["ev_rag_project"],
                "risk_tip": "避免泛泛表达兴趣，要落到岗位关键词和具体成果。",
            }
        ],
        "reverse_questions": ["这个岗位前三个月最重要的交付目标是什么？"],
        "seven_day_plan": [
            {"day": 1, "title": "梳理岗位关键词", "focus": "提取 JD 中最高频的能力要求。"},
            {"day": 2, "title": "补齐项目证据", "focus": "为每个核心能力匹配一段可追问项目经历。"},
            {"day": 3, "title": "模拟深挖追问", "focus": "按 STAR 结构压缩项目表达。"},
        ],
    }
    return GeneratedPayload(result=result, source="fallback_mock")
