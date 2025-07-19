# Install and build containers
install:
	yarn install && docker compose up --no-deps --build -d api-access-control access-control-db

# Start containers to api
run:
	docker compose up -d api-access-control access-control-db

# Run migrations Typeorm
run-migrate:
	yarn migration:run

# Watch log api
watch-log:
	docker compose logs --follow api-access-control

# Comando para gerar uma nova migration a partir das entidades
generate-migration:
	yarn typeorm migration:generate ./db/migrations/$(NAME)