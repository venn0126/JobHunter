from __future__ import annotations

from pathlib import Path
import re
import secrets

from core.config import get_settings
from core.ids import new_public_id
from services.resume_version_write_service import create_resume_version
from services.result import ServiceResult
from services.task_state_service import utc_now

DEMO_RESUME_CONTENT = """# Demo 简历

## 求职方向
- AI 应用工程师 / LLM 工程师

## 核心能力
- Python、FastAPI、React、RAG、向量检索
- 后端接口设计、Redis 缓存、任务状态与可观测性

## 项目经历
- 企业知识库 RAG 项目：建设检索链路、后端接口和评估看板，提升问答命中率并降低响应延迟。
"""


def parse_resume_upload_body(*, content_type: str, body: bytes) -> ServiceResult:
    filename = "resume.txt"
    content = body
    if content_type.startswith("multipart/form-data"):
        parsed = parse_single_file_multipart(content_type=content_type, body=body)
        if parsed.status != "ok":
            return parsed
        filename = parsed.data["filename"]
        content = parsed.data["content"]
    return create_uploaded_resume_version(filename=filename, content=content)


def parse_single_file_multipart(*, content_type: str, body: bytes) -> ServiceResult:
    boundary_match = re.search(r"boundary=(?P<boundary>[^;]+)", content_type)
    if not boundary_match:
        return ServiceResult(status="invalid", message="multipart boundary is required")

    boundary = boundary_match.group("boundary").strip('"')
    delimiter = f"--{boundary}".encode("utf-8")
    for part in body.split(delimiter):
        if b'Content-Disposition:' not in part or b'name="file"' not in part:
            continue
        header_blob, _, content = part.partition(b"\r\n\r\n")
        if not content:
            return ServiceResult(status="invalid", message="resume file content is required")
        content = content.removesuffix(b"\r\n").removesuffix(b"--").removesuffix(b"\r\n")
        filename_match = re.search(rb'filename="(?P<filename>[^"]*)"', header_blob)
        filename = filename_match.group("filename").decode("utf-8", errors="ignore") if filename_match else ""
        return ServiceResult(status="ok", data={"content": content, "filename": filename})

    return ServiceResult(status="invalid", message="resume file field is required")


def normalize_resume_filename(filename: str) -> str:
    return Path(filename or "").name.strip()


def validate_resume_upload(*, filename: str, size_bytes: int) -> ServiceResult:
    settings = get_settings()
    normalized_filename = normalize_resume_filename(filename)
    if not normalized_filename:
        return ServiceResult(status="invalid", message="resume filename is required")
    if size_bytes <= 0:
        return ServiceResult(status="invalid", message="resume file is empty")
    if size_bytes > settings.resume_upload_max_bytes:
        return ServiceResult(status="invalid", message="resume file is too large")

    extension = Path(normalized_filename).suffix.lower()
    allowed_extensions = {item.lower() for item in settings.resume_upload_allowed_extensions}
    if extension not in allowed_extensions:
        return ServiceResult(status="invalid", message="unsupported resume file type")

    return ServiceResult(status="ok", data={"extension": extension, "filename": normalized_filename})


def create_uploaded_resume_version(*, filename: str, content: bytes) -> ServiceResult:
    validation = validate_resume_upload(filename=filename, size_bytes=len(content))
    if validation.status != "ok":
        return validation

    metadata = validation.data
    stored_file = store_resume_file(filename=metadata["filename"], content=content)
    version_result = create_resume_version(
        name=f"上传简历 {metadata['filename']}",
        content=decode_resume_preview(content),
        sections=[
            {
                "section": "原始简历",
                "after": f"已接收文件：{metadata['filename']}",
                "reason": "P3 阶段完成上传接入与版本登记，后续算法接入后再进行完整解析。",
            }
        ],
    )
    if version_result.status not in {"stored", "hit", "ok"}:
        stored_file.unlink(missing_ok=True)
        return version_result

    return ServiceResult(
        status=version_result.status,
        data={
            "resume_id": new_public_id("resume_file"),
            "version": version_result.data,
            "filename": metadata["filename"],
            "stored_path": str(stored_file.relative_to(get_settings().project_root)),
            "size_bytes": len(content),
            "uploaded_at": utc_now(),
        },
        message=version_result.message,
    )


def create_demo_resume_version() -> ServiceResult:
    version_result = create_resume_version(
        name="Demo 样例简历",
        content=DEMO_RESUME_CONTENT,
        sections=[
            {
                "section": "样例简历",
                "after": "已加载 AI 应用工程师方向样例简历。",
                "reason": "用于快速演示简历画像、版本实验和岗位定制链路。",
                "evidence_id": "ev_rag_project",
            }
        ],
    )
    if version_result.status not in {"stored", "hit", "ok"}:
        return version_result

    return ServiceResult(
        status=version_result.status,
        data={
            "resume_id": "resume_demo_001",
            "version": version_result.data,
            "loaded_at": utc_now(),
        },
        message=version_result.message,
    )


def decode_resume_preview(content: bytes) -> str:
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        return ""
    return text[:20000]


def store_resume_file(*, filename: str, content: bytes) -> Path:
    settings = get_settings()
    upload_dir = settings.resume_upload_dir
    if not upload_dir.is_absolute():
        upload_dir = settings.project_root / upload_dir
    upload_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(filename).suffix.lower()
    stored_path = upload_dir / f"{new_public_id('resume_upload')}_{secrets.token_hex(4)}{suffix}"
    stored_path.write_bytes(content)
    return stored_path
