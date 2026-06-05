#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log verify-write-api
load_runtime_env
configure_runtime_env
ensure_dependencies "verify-write-api"
./scripts/infra-up.sh
./scripts/migrate.sh
./scripts/seed-demo.sh

PORT="$(reserve_local_port)"
echo "[verify-write-api] starting backend on 127.0.0.1:${PORT}"
start_backend_server "$PORT" "${OPS_LOG_PATH}.server"
SERVER_PID="$BACKEND_SERVER_PID"

cleanup() {
  cleanup_backend_server "$SERVER_PID"
}
trap cleanup EXIT

wait_for_backend_health "$PORT"

python3 - "$PORT" <<'PY'
import json
import os
import sys
import urllib.error
import urllib.request

port = sys.argv[1]
base_url = f"http://127.0.0.1:{port}/api"
os.environ["no_proxy"] = "127.0.0.1,localhost,*"
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def request(method, path, body=None):
    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(base_url + path, data=data, headers=headers, method=method)
    try:
        with opener.open(req, timeout=8) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read().decode("utf-8"))


def must_ok(method, path, body=None):
    status, payload = request(method, path, body)
    if status != 200 or not payload.get("success"):
        raise SystemExit(f"request failed: {method} {path} {status} {payload}")
    return payload["data"], payload


pipeline_before, _ = must_ok("GET", "/pipeline")
initial_count = len(pipeline_before["entries"])

created_pipeline, created_payload = must_ok(
    "POST",
    "/pipeline/cards",
    {"job_id": "job_1006", "status": "interested", "next_action": "验证写接口加入管线"},
)
if created_pipeline["entry"]["job"]["id"] != "job_1006" or len(created_pipeline["entries"]) != initial_count + 1:
    raise SystemExit(f"pipeline create failed: {created_payload}")
print("[verify-write-api] ok create pipeline card")

duplicate_pipeline, duplicate_payload = must_ok(
    "POST",
    "/pipeline/cards",
    {"job_id": "job_1006", "status": "interested"},
)
if duplicate_payload["message"] != "pipeline card already exists" or len(duplicate_pipeline["entries"]) != initial_count + 1:
    raise SystemExit(f"pipeline duplicate failed: {duplicate_payload}")
print("[verify-write-api] ok duplicate pipeline card")

patched_pipeline, _ = must_ok("PATCH", "/pipeline/cards/job_1006", {"status": "tailored", "notes": "已定制验证简历"})
if patched_pipeline["entry"]["status"] != "tailored" or patched_pipeline["entry"].get("notes") != "已定制验证简历":
    raise SystemExit(f"pipeline patch failed: {patched_pipeline}")
status, payload = request("PATCH", "/pipeline/cards/job_1006", {"status": "offer"})
if status != 409 or payload["code"] != "CONFLICT":
    raise SystemExit(f"pipeline invalid transition failed: {status} {payload}")
print("[verify-write-api] ok pipeline transition guard")

vault_created, _ = must_ok(
    "POST",
    "/vault/items",
    {
        "type": "project",
        "title": "验证写入素材",
        "summary": "用于验证 P3-H 写接口。",
        "tags": ["P3-H", "验证", "验证"],
        "skills": ["FastAPI", "Redis"],
        "impact": "写入后刷新可读。",
        "star": {"situation": "测试", "task": "验证", "action": "调用 API", "result": "成功"},
    },
)
vault_id = vault_created["id"]
if vault_created["tags"].count("验证") != 1:
    raise SystemExit(f"vault tag normalize failed: {vault_created}")
vault_detail, _ = must_ok("GET", f"/vault/items/{vault_id}")
if vault_detail["title"] != "验证写入素材":
    raise SystemExit(f"vault detail failed: {vault_detail}")
vault_updated, _ = must_ok("PATCH", f"/vault/items/{vault_id}", {"title": "验证写入素材-已更新", "skills": ["Redis"]})
if vault_updated["title"] != "验证写入素材-已更新" or vault_updated["skills"] != ["Redis"]:
    raise SystemExit(f"vault patch failed: {vault_updated}")
deleted, _ = must_ok("DELETE", f"/vault/items/{vault_id}")
if not deleted["deleted"]:
    raise SystemExit(f"vault delete failed: {deleted}")
status, payload = request("GET", f"/vault/items/{vault_id}")
if status != 404:
    raise SystemExit(f"vault delete 404 failed: {status} {payload}")
print("[verify-write-api] ok vault write lifecycle")

feedback_record, _ = must_ok(
    "POST",
    "/feedback",
    {
        "job_id": "job_1006",
        "resume_version_id": "resume_ai_app_v2",
        "outcome": "interview",
        "notes": "收到面试验证记录",
        "next_action": "准备面试",
        "feedback_tags": ["面试", "P3-H"],
    },
)
if feedback_record["job_id"] != "job_1006" or feedback_record["outcome"] != "interview":
    raise SystemExit(f"feedback create failed: {feedback_record}")
feedback_id = feedback_record["id"]
feedback_updated, _ = must_ok("PATCH", f"/feedback/{feedback_id}", {"outcome": "offer", "next_action": "评估 Offer"})
if feedback_updated["outcome"] != "offer" or "follow_up_at" in feedback_updated:
    raise SystemExit(f"feedback patch failed: {feedback_updated}")
feedback_review, _ = must_ok("GET", "/feedback")
if not any(item["id"] == feedback_id and item["outcome"] == "offer" for item in feedback_review["records"]):
    raise SystemExit(f"feedback read after write failed: {feedback_review}")
print("[verify-write-api] ok feedback write lifecycle")

resume_version, _ = must_ok(
    "POST",
    "/resumes/versions",
    {
        "name": "P3-H 验证简历版本",
        "job_id": "job_1006",
        "sections": [{"section": "验证", "after": "写接口保存版本"}],
        "content": "验证简历版本内容",
    },
)
resume_id = resume_version["id"]
versions, _ = must_ok("GET", "/resumes/versions?page=1&page_size=5")
if not any(item["id"] == resume_id for item in versions["items"]):
    raise SystemExit(f"resume version read after write failed: {versions}")
lab, _ = must_ok("GET", "/resume-lab")
if not any(item["id"] == resume_id for item in lab["versions"]):
    raise SystemExit(f"resume lab read after write failed: {lab}")
print("[verify-write-api] ok resume version create")

pipeline_after, _ = must_ok("GET", "/pipeline")
if not any(entry["job"]["id"] == "job_1006" and entry["status"] == "tailored" for entry in pipeline_after["entries"]):
    raise SystemExit(f"pipeline read after write failed: {pipeline_after}")
print("[verify-write-api] ok read after write")
PY

echo "[verify-write-api] ok"
