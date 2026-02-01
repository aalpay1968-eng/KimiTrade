# Trading Platform Makefile
.PHONY: help dev build test lint clean docker-up docker-down migrate proto

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Trading Platform - Available Commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Development
dev: ## Start all development services
	@echo "$(BLUE)Starting development environment...$(NC)"
	$(MAKE) docker-up
	$(MAKE) run-services

run-services: ## Run Rust services
	@echo "$(BLUE)Starting Rust services...$(NC)"
	cargo watch -x "run -p market-data" &
	cargo watch -x "run -p charting-engine" &
	cd apps/web && pnpm dev

dev-web: ## Start only web frontend
	@echo "$(BLUE)Starting web frontend...$(NC)"
	cd apps/web && pnpm dev

dev-rust: ## Start only Rust services
	@echo "$(BLUE)Starting Rust services...$(NC)"
	cargo watch -x "run -p market-data" &
	cargo watch -x "run -p charting-engine"

# Build
build: ## Build all services
	@echo "$(BLUE)Building all services...$(NC)"
	cargo build --release
	cd apps/web && pnpm build

build-rust: ## Build only Rust services
	@echo "$(BLUE)Building Rust services...$(NC)"
	cargo build --release

build-web: ## Build only web frontend
	@echo "$(BLUE)Building web frontend...$(NC)"
	cd apps/web && pnpm build

# Testing
test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(NC)"
	cargo test
	cd apps/web && pnpm test

test-rust: ## Run Rust tests
	@echo "$(BLUE)Running Rust tests...$(NC)"
	cargo test

test-web: ## Run web tests
	@echo "$(BLUE)Running web tests...$(NC)"
	cd apps/web && pnpm test

test-e2e: ## Run E2E tests
	@echo "$(BLUE)Running E2E tests...$(NC)"
	cd apps/web && pnpm test:e2e

# Linting and Formatting
lint: ## Run all linters
	@echo "$(BLUE)Running linters...$(NC)"
	cargo clippy --all-targets --all-features -- -D warnings
	cd apps/web && pnpm lint

lint-rust: ## Run Rust linter
	@echo "$(BLUE)Running Rust linter...$(NC)"
	cargo clippy --all-targets --all-features -- -D warnings

lint-web: ## Run web linter
	@echo "$(BLUE)Running web linter...$(NC)"
	cd apps/web && pnpm lint

format: ## Format all code
	@echo "$(BLUE)Formatting code...$(NC)"
	cargo fmt --all
	cd apps/web && pnpm format

format-check: ## Check formatting
	@echo "$(BLUE)Checking formatting...$(NC)"
	cargo fmt --all -- --check
	cd apps/web && pnpm format:check

# Docker
docker-up: ## Start Docker services
	@echo "$(BLUE)Starting Docker services...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d

docker-down: ## Stop Docker services
	@echo "$(BLUE)Stopping Docker services...$(NC)"
	docker-compose -f docker-compose.dev.yml down

docker-logs: ## View Docker logs
	@echo "$(BLUE)Viewing Docker logs...$(NC)"
	docker-compose -f docker-compose.dev.yml logs -f

docker-clean: ## Clean Docker containers and volumes
	@echo "$(YELLOW)Cleaning Docker containers and volumes...$(NC)"
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

# Database
db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	sqlx migrate run

db-reset: ## Reset database
	@echo "$(YELLOW)Resetting database...$(NC)"
	sqlx database reset

db-seed: ## Seed database with test data
	@echo "$(BLUE)Seeding database...$(NC)"
	./infrastructure/scripts/seed.sh

# Protocol Buffers
proto: ## Generate protobuf code
	@echo "$(BLUE)Generating protobuf code...$(NC)"
	cd shared/protobuf && ./generate.sh

# Utilities
clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	cargo clean
	cd apps/web && rm -rf .next dist node_modules
	cd packages && rm -rf */dist */node_modules

install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	pnpm install

check: ## Run all checks (lint, test, format)
	@echo "$(BLUE)Running all checks...$(NC)"
	$(MAKE) format-check
	$(MAKE) lint
	$(MAKE) test

update: ## Update dependencies
	@echo "$(BLUE)Updating dependencies...$(NC)"
	cargo update
	cd apps/web && pnpm update

# Release
release-patch: ## Create patch release
	@echo "$(BLUE)Creating patch release...$(NC)"
	pnpm changeset
	pnpm version-packages
	pnpm release

# Monitoring
logs: ## View all service logs
	@echo "$(BLUE)Viewing logs...$(NC)"
	tail -f logs/*.log

metrics: ## View Prometheus metrics
	@echo "$(BLUE)Prometheus metrics: http://localhost:9090$(NC)"
	open http://localhost:9090 || xdg-open http://localhost:9090 || echo "Open http://localhost:9090"

grafana: ## Open Grafana dashboard
	@echo "$(BLUE)Grafana dashboard: http://localhost:3001$(NC)"
	open http://localhost:3001 || xdg-open http://localhost:3001 || echo "Open http://localhost:3001"

# Health checks
health: ## Check service health
	@echo "$(BLUE)Checking service health...$(NC)"
	@curl -s http://localhost:8080/health | jq . || echo "Market Data: $(RED)DOWN$(NC)"
	@curl -s http://localhost:8081/health | jq . || echo "Charting: $(RED)DOWN$(NC)"
	@curl -s http://localhost:3000/api/health | jq . || echo "Web: $(RED)DOWN$(NC)"

# Documentation
docs: ## Generate documentation
	@echo "$(BLUE)Generating documentation...$(NC)"
	cargo doc --no-deps --open
	cd apps/web && pnpm storybook

# Benchmarks
bench: ## Run benchmarks
	@echo "$(BLUE)Running benchmarks...$(NC)"
	cargo bench

# Security
audit: ## Run security audit
	@echo "$(BLUE)Running security audit...$(NC)"
	cargo audit
	cd apps/web && pnpm audit

# Deployment
deploy-staging: ## Deploy to staging
	@echo "$(BLUE)Deploying to staging...$(NC)"
	./infrastructure/scripts/deploy-staging.sh

deploy-prod: ## Deploy to production
	@echo "$(GREEN)Deploying to production...$(NC)"
	./infrastructure/scripts/deploy-production.sh
