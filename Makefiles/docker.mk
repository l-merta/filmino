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

## Start development environment without filmino fe
up-dev-light:
	$(COMPOSE_DEV) down --remove-orphans
	$(COMPOSE_DEV) up --build -d --scale filmino=0
	make prisma-generate
	make migrate-deploy
	cd app && npm run dev

## Stop development environment
down-dev:
	$(COMPOSE_DEV) down

## Start production environment
up-prod:
	$(COMPOSE_PROD) down --remove-orphans
	$(COMPOSE_PROD) up --build -d
  make prisma-generate
  make migrate-deploy
#	PRISMA_ENGINES_USE_BINARY_TARGETS=1 \
#	PRISMA_CLIENT_ENGINE_TYPE=binary \
#	PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
##	$(COMPOSE_PROD) exec -T filmino npx prisma migrate deploy --schema=./prisma/schema.prisma


## Stop production environment
down-prod:
	$(COMPOSE_PROD) down

prune:
	docker system prune -f --volumes