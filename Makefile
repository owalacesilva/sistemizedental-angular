.DEFAULT_GOAL := help
.PHONY: help install start build test test-ci lint clean rebuild reinstall \
        docker-up docker-down docker-logs docker-shell docker-build docker-rebuild \
        docker-prod docker-prod-down docker-ci docker-test-image docker-clean

NPM    ?= npm
NG     ?= npx ng
DC     ?= docker compose
SERVICE ?= web

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

##@ Local (npm)

install: ## Install dependencies
	$(NPM) ci

start: ## Run dev server at http://localhost:4200
	$(NPM) run start

build: ## Build the app
	$(NPM) run build

test: ## Run unit tests (watch mode)
	$(NPM) run test

test-ci: ## Run unit tests once with coverage
	$(NPM) run test:ci

lint: ## Run linter
	$(NPM) run lint

clean: ## Remove build output and Angular cache
	rm -rf dist .angular

rebuild: clean build ## Clean and rebuild

reinstall: clean ## Clean and reinstall dependencies
	rm -rf node_modules
	$(NPM) ci

##@ Docker

docker-up: ## Start dev server in Docker (http://localhost:4200)
	$(DC) up -d web

docker-down: ## Stop and remove containers
	$(DC) --profile prod --profile ci down

docker-logs: ## Follow dev server logs
	$(DC) logs -f $(SERVICE)

docker-shell: ## Open a shell in the dev container
	$(DC) exec $(SERVICE) sh

docker-build: ## Build the dev image
	$(DC) build web

docker-rebuild: ## Rebuild dev image without cache and restart
	$(DC) build --no-cache web
	$(DC) up -d --force-recreate web

docker-prod: ## Build and run the nginx production image (http://localhost:8080)
	$(DC) --profile prod up -d --build web-prod

docker-prod-down: ## Stop the production container
	$(DC) --profile prod stop web-prod
	$(DC) --profile prod rm -f web-prod

docker-ci: ## Run lint + unit tests in Docker
	$(DC) --profile ci run --rm ci

docker-test-image: ## Run the Dockerfile test stage (CI)
	docker build --target test .

docker-clean: ## Remove containers, volumes and images for this project
	$(DC) --profile prod --profile ci down -v --rmi local
