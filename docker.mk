# Variables
COMPOSE_DEV = docker compose -f ./app/docker-compose-dev.yml
COMPOSE_PROD = docker compose -f ./app/docker-compose-prod.yml

# Targets
.PHONY: up-dev down-dev up-prod down-prod build-dev build-prod

## Start development environment
up-dev:
	$(COMPOSE_DEV) down --remove-orphans
	$(COMPOSE_DEV) up --build -d
	make prisma-generate
	make migrate-deploy

## Stop development environment
down-dev:
	$(COMPOSE_DEV) down

## Start production environment
up-prod:
	$(COMPOSE_PROD) down --remove-orphans
	$(COMPOSE_PROD) up --build -d

## Stop production environment
down-prod:
	$(COMPOSE_PROD) down

prune:
	docker system prune -f --volumes