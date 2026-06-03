SHELL := /bin/bash

.PHONY: init dev start migrate upgrade health sync-version reset-demo rollback verify-version-cache verify-validation-sandbox verify-update-restore

init:
	./scripts/init.sh

dev:
	./scripts/dev.sh

start:
	./scripts/start.sh

migrate:
	./scripts/migrate.sh

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
