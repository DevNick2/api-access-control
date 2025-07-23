# Install and build containers
install:
	yarn install && docker compose up --no-deps --build -d

# Start containers to api
run:
	docker compose up -d
	
# Start containers to api
stop:
	docker compose down

# Watch log api
watch:
	docker compose logs --follow api-access-control

# Run migrations Typeorm
run-migration:
	docker exec -it api-access-control yarn migration:run

# Comando para gerar uma nova migration a partir das entidades
generate-migration:
	docker exec -it api-access-control yarn typeorm migration:generate ./db/migrations/$(NAME)