#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log verify-redis-cache
load_runtime_env
configure_runtime_env
ensure_dependencies "verify-redis-cache"
./scripts/infra-up.sh

echo "[verify-redis-cache] checking cache and task state"
(cd backend && source .venv/bin/activate && REDIS_URL="$REDIS_URL" python - <<'PY'
from core.redis_keys import cache_key, cache_pattern, input_hash
from services.cache_service import RedisJsonCache
from services.task_state_service import RedisTaskStateStore, build_task_state

payload = {"scope": "verify", "value": 1}
key = cache_key("verify", "user_demo", "persona_demo", "target_demo", "v1", input_hash(payload))
cache = RedisJsonCache(ttl_seconds=60)

set_result = cache.set(key, payload)
if set_result.status != "stored":
    raise SystemExit(f"cache set failed: {set_result}")

get_result = cache.get(key)
if get_result.status != "hit" or get_result.data != payload:
    raise SystemExit(f"cache get failed: {get_result}")

delete_result = cache.delete_pattern(cache_pattern("verify", "user_demo", "persona_demo", "target_demo"))
if delete_result.status != "deleted" or delete_result.data["count"] < 1:
    raise SystemExit(f"cache delete failed: {delete_result}")

task_store = RedisTaskStateStore(ttl_seconds=60)
task_id = "verify_task_demo"
state = build_task_state(task_id=task_id, status="running", progress=50, message="verifying redis")
state_result = task_store.set_state(state)
if state_result.status != "stored":
    raise SystemExit(f"task state set failed: {state_result}")

task_store.append_event(task_id, "progress", "halfway", {"progress": 50})
read_result = task_store.get_state(task_id)
events_result = task_store.list_events(task_id)
if read_result.status != "hit" or read_result.data["status"] != "running":
    raise SystemExit(f"task state get failed: {read_result}")
if not events_result.data:
    raise SystemExit(f"task event list failed: {events_result}")

print("[verify-redis-cache] redis cache ok")
print("[verify-redis-cache] task state ok")
PY
)

echo "[verify-redis-cache] ok"
