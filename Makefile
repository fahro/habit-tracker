.PHONY: help build up down logs shell clean dev prod restart

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker image
	docker-compose build

up: ## Start containers in production mode
	docker-compose up -d

down: ## Stop and remove containers
	docker-compose down

logs: ## View container logs
	docker-compose logs -f

shell: ## Open shell in running container
	docker-compose exec app sh

clean: ## Remove containers, volumes, and images
	docker-compose down -v --rmi all

dev: ## Start development mode with hot reload
	docker-compose --profile dev up app-dev

prod: ## Start production mode
	docker-compose up -d app

restart: ## Restart containers
	docker-compose restart

stats: ## Show container resource usage
	docker stats study-tracker

prune: ## Clean up unused Docker resources
	docker system prune -af --volumes
