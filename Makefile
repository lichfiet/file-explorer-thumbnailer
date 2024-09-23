# import config.
# You can change the default config with `make cnf="config_special.env" build`
cnf ?= ./.env
include $(cnf)
export $(shell sed 's/=.*//' $(cnf))

# HELP
# thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "%-30s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help


# DOCKER TASKS
build: ## Build the container
	docker build -t $(APP_NAME):dev --platform linux/amd64 -f ./development/Dockerfile . --target=dev

build-nc: ## Build the container without no cache
	docker build -t $(APP_NAME):dev --platform linux/amd64 --no-cache -f ./development/Dockerfile .

start: ## Start node and redis in docker compose
	docker compose -f ./development/compose.yaml --env-file .env up 

start-d: ## Start node and redis in docker compose
	docker compose -f ./docker/compose.yaml up -d

stop: ## stop docker compose
	docker compose -f ./docker/compose.yaml down





# Clean Up
clean: # Remove images, modules, and cached build layers
	rm -rf node_modules
	-docker stop ${APP_NAME}
	-docker rm ${APP_NAME}
	-docker image rm ${APP_NAME}:dev
	-docker image rm ${APP_NAME}:latest
	-docker rmi $$(docker images -f "dangling=true" -q)

init: # Initailize development environment and start it
	chmod u+x ./development/dev-init.sh
	./development/dev-init.sh
	@echo "\n...Building Web Container Image... \n"
	docker build -t $(APP_NAME):dev --platform linux/amd64 -f ./development/Dockerfile . --target=dev
	@echo "\n...Development Environment Successfully Initialied... \n"
	@echo "\nType 'make help' for a list of commands\n"