.PHONY: lint format format-check check quickup


quickup:
	docker compose up go-server frontend-dev web imputer-service -d

lint:
	docker compose run --rm lint

format:
	golangci-lint fmt --verbose

format-check:
	golangci-lint fmt --diff-colored

check:
	golangci-lint run --verbose


