.PHONY: lint format format-check check

lint:
	docker compose run --rm lint

format:
	golangci-lint fmt --verbose

format-check:
	golangci-lint fmt --diff-colored

check:
	golangci-lint run --verbose


