# Makefile for Prisma & DB tasks
ENV_FILE=../.env
SCHEMA=./prisma/schema.prisma
PRISMA=npx prisma

# Set working dir for Prisma commands
APP_DIR=./app

# Run Prisma commands inside app/
define PRISMA_CMD
	cd $(APP_DIR) && $(PRISMA) $(1) --schema=$(SCHEMA) --env-file=$(ENV_FILE)
endef

.PHONY: prisma-generate migrate new-migrate prisma-push prisma-studio prisma-reset help

# Generate the Prisma client
prisma-generate:
	$(call PRISMA_CMD,generate)

# Apply migrations and start dev DB
migrate:
	$(call PRISMA_CMD,migrate dev)

# Create new migration with name
new-migrate:
	cd $(APP_DIR) && $(PRISMA) migrate dev --name $$NAME --schema=$(SCHEMA)

# Push schema without generating SQL migration (for prototyping)
prisma-push:
	$(call PRISMA_CMD,db push)

# Open Prisma Studio
prisma-studio:
	$(call PRISMA_CMD,studio)

# Reset the database (DANGEROUS!)
prisma-reset:
	$(call PRISMA_CMD, migrate reset --force)

# Help
help:
	@echo "Usage: make <command>"
	@echo ""
	@echo "Commands:"
	@echo "  prisma-generate        Generate Prisma client"
	@echo "  prisma-migrate         Run migration and start dev"
	@echo "  prisma-new-migration   Create a new migration with name"
	@echo "  prisma-push            Push schema to DB without migration"
	@echo "  prisma-studio          Open Prisma Studio"
	@echo "  prisma-reset           Reset database (use with caution)"
