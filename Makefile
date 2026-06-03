SHELL := /bin/bash

.PHONY: init dev start migrate upgrade health sync-version

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
