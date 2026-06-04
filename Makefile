SHELL := /bin/bash

.PHONY: init infra-up infra-down infra-logs dev start deploy-local migrate seed-demo upgrade health sync-version reset-demo rollback verify-version-cache verify-validation-sandbox verify-update-restore verify-browser-cache

init:
	./scripts/init.sh

infra-up:
	./scripts/infra-up.sh

infra-down:
	./scripts/infra-down.sh

infra-logs:
	./scripts/infra-logs.sh

dev:
	./scripts/dev.sh

start:
	./scripts/start.sh

deploy-local:
	./scripts/deploy-local.sh

migrate:
	./scripts/migrate.sh

seed-demo:
	./scripts/seed-demo.sh

upgrade:
	./scripts/upgrade.sh

health:
	./scripts/health.sh

sync-version:
	./scripts/sync-version.sh

reset-demo:
	./scripts/reset-demo.sh

rollback:
	./scripts/rollback.sh

verify-version-cache:
	./scripts/verify-version-cache.sh

verify-validation-sandbox:
	./scripts/verify-validation-sandbox.sh

verify-update-restore:
	./scripts/verify-update-restore.sh

verify-browser-cache:
	./scripts/verify-browser-cache.sh
