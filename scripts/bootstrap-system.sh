#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log bootstrap-system

APT_UPDATED=false
APT_LOCK_WAIT_SECONDS="${APT_LOCK_WAIT_SECONDS:-300}"
APT_STALE_LOCK_SECONDS="${APT_STALE_LOCK_SECONDS:-3600}"

run_root() {
  if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
    "$@"
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo "$@"
    return
  fi

  echo "[bootstrap-system] root permission is required to install system packages"
  echo "[bootstrap-system] rerun as root or install sudo"
  exit 1
}

run_root_stream() {
  if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
    "$@"
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo "$@"
    return
  fi

  echo "[bootstrap-system] root permission is required to install system packages"
  echo "[bootstrap-system] rerun as root or install sudo"
  exit 1
}

apt_processes() {
  if command -v fuser >/dev/null 2>&1; then
    local lock_file
    for lock_file in \
      /var/lib/dpkg/lock-frontend \
      /var/lib/dpkg/lock \
      /var/lib/apt/lists/lock \
      /var/cache/apt/archives/lock; do
      if [[ -e "$lock_file" ]]; then
        fuser "$lock_file" 2>/dev/null || true
      fi
    done
    return
  fi

  pgrep -x apt 2>/dev/null || true
  pgrep -x apt-get 2>/dev/null || true
  pgrep -x dpkg 2>/dev/null || true
}

wait_for_apt_processes() {
  local waited=0
  local pids=""

  while true; do
    pids="$(apt_processes | tr ' ' '\n' | sed '/^$/d' | sort -u | tr '\n' ' ')"
    if [[ -z "$pids" ]]; then
      return
    fi

    local stale_pids=""
    local pid=""
    for pid in $pids; do
      local etimes=""
      etimes="$(ps -o etimes= -p "$pid" 2>/dev/null | tr -d ' ' || true)"
      if [[ "$etimes" =~ ^[0-9]+$ && "$etimes" -ge "$APT_STALE_LOCK_SECONDS" ]]; then
        stale_pids="${stale_pids}${pid} "
      fi
    done

    if [[ -n "$stale_pids" ]]; then
      echo "[bootstrap-system] apt/dpkg lock looks stale after ${APT_STALE_LOCK_SECONDS}s: ${stale_pids}"
      ps -o pid,ppid,stat,etime,comm,args -p $stale_pids || true
      echo "[bootstrap-system] inspect the process first. If it is stuck, stop it manually, then run:"
      echo "[bootstrap-system]   dpkg --configure -a && apt-get -f install -y && apt-get update"
      echo "[bootstrap-system] retry after cleanup: make init"
      exit 1
    fi

    if [[ "$waited" -ge "$APT_LOCK_WAIT_SECONDS" ]]; then
      echo "[bootstrap-system] apt/dpkg is still running after ${APT_LOCK_WAIT_SECONDS}s: ${pids}"
      ps -o pid,ppid,stat,etime,comm,args -p $pids || true
      echo "[bootstrap-system] wait for the process to finish, or inspect it manually before retrying make init"
      exit 1
    fi

    echo "[bootstrap-system] waiting for apt/dpkg lock holders: ${pids}"
    ps -o pid,ppid,stat,etime,comm,args -p $pids || true
    sleep 5
    waited=$((waited + 5))
  done
}

apt_run() {
  local output_file
  output_file="$(mktemp)"

  while true; do
    wait_for_apt_processes

    set +e
    run_root_stream "$@" 2>&1 | tee "$output_file"
    local status="${PIPESTATUS[0]}"
    set -e

    if [[ "$status" -eq 0 ]]; then
      rm -f "$output_file"
      return 0
    fi

    if grep -Eiq "Could not get lock|Unable to lock|is another process using it|dpkg frontend lock" "$output_file"; then
      echo "[bootstrap-system] apt lock detected, retrying in 5s"
      sleep 5
      continue
    fi

    rm -f "$output_file"
    return "$status"
  done
}

apt_update_once() {
  if [[ "$APT_UPDATED" == "false" ]]; then
    apt_run apt-get update
    APT_UPDATED=true
  fi
}

apt_install() {
  apt_update_once
  apt_run env DEBIAN_FRONTEND=noninteractive apt-get install -y "$@"
}

apt_has_package() {
  apt-cache show "$1" >/dev/null 2>&1
}

is_debian_like() {
  [[ -f /etc/os-release ]] && . /etc/os-release && [[ "${ID_LIKE:-$ID}" == *"debian"* || "${ID:-}" == "ubuntu" || "${ID:-}" == "debian" ]]
}

node_is_usable() {
  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    return 1
  fi

  local major
  major="$(node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)"
  [[ "$major" -ge 20 ]]
}

install_nodejs() {
  if node_is_usable; then
    echo "[bootstrap-system] node ok: $(node --version), npm $(npm --version)"
    return
  fi

  echo "[bootstrap-system] installing Node.js 22"
  apt_install ca-certificates curl gnupg
  run_root install -d -m 0755 /etc/apt/keyrings
  run_root rm -f /etc/apt/keyrings/nodesource.gpg
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | run_root gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | run_root tee /etc/apt/sources.list.d/nodesource.list >/dev/null
  APT_UPDATED=false
  apt_install nodejs

  if ! node_is_usable; then
    echo "[bootstrap-system] Node.js >= 20 and npm are required"
    exit 1
  fi

  echo "[bootstrap-system] node installed: $(node --version), npm $(npm --version)"
}

install_python_venv() {
  apt_install python3 python3-pip

  local py_version
  py_version="$(python3 - <<'PY'
import sys
print(f"{sys.version_info.major}.{sys.version_info.minor}")
PY
)"

  local venv_pkg="python${py_version}-venv"
  if apt_has_package "$venv_pkg"; then
    apt_install "$venv_pkg"
  else
    apt_install python3-venv
  fi

  python3 - <<'PY'
import ensurepip

print("[bootstrap-system] ensurepip ok")
PY
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "[bootstrap-system] docker ok: $(docker --version)"
    echo "[bootstrap-system] docker compose ok: $(docker compose version)"
  else
    echo "[bootstrap-system] installing Docker and Compose"
    local compose_pkg=""
    if apt_has_package docker-compose-v2; then
      compose_pkg="docker-compose-v2"
    elif apt_has_package docker-compose-plugin; then
      compose_pkg="docker-compose-plugin"
    elif apt_has_package docker-compose; then
      compose_pkg="docker-compose"
    fi

    if [[ -n "$compose_pkg" ]]; then
      apt_install docker.io "$compose_pkg"
    else
      apt_install docker.io
    fi
  fi

  if command -v systemctl >/dev/null 2>&1; then
    run_root systemctl enable --now docker >/dev/null 2>&1 || true
  fi
  if ! docker info >/dev/null 2>&1 && command -v service >/dev/null 2>&1; then
    run_root service docker start >/dev/null 2>&1 || true
  fi

  if ! docker info >/dev/null 2>&1; then
    echo "[bootstrap-system] docker is installed but not running"
    echo "[bootstrap-system] start Docker and rerun: make init"
    exit 1
  fi

  if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
    echo "[bootstrap-system] docker compose is required but was not found"
    exit 1
  fi

  echo "[bootstrap-system] docker ready"
}

case "$(uname -s)" in
  Linux)
    if ! is_debian_like; then
      echo "[bootstrap-system] unsupported Linux distribution for auto-install"
      echo "[bootstrap-system] required: git make python3 python3-venv node>=20 npm docker docker-compose"
      exit 1
    fi

    apt_install ca-certificates curl gnupg git make build-essential
    install_python_venv
    install_nodejs
    install_docker
    ;;
  Darwin)
    echo "[bootstrap-system] macOS detected; system packages are not auto-installed"
    echo "[bootstrap-system] required locally: python3, node>=20, npm, Docker Desktop"
    ;;
  *)
    echo "[bootstrap-system] unsupported OS: $(uname -s)"
    echo "[bootstrap-system] required: git make python3 python3-venv node>=20 npm docker docker-compose"
    exit 1
    ;;
esac

echo "[bootstrap-system] ok"
