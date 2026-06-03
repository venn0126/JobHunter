SHELL := /bin/bash

.PHONY: init dev start migrate upgrade health sync-version reset-demo verify-version-cache verify-validation-sandbox

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

verify-version-cache:
	./scripts/verify-version-cache.sh

verify-validation-sandbox:
	./scripts/verify-validation-sandbox.sh
