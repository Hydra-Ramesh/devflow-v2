.PHONY: all build run test clean docker-build docker-run tidy

APP_NAME = vote-service
DOCKER_IMAGE = devflow-v2/vote-service

all: build

build:
	@echo "==> Building Vote binary..."
	go build -ldflags="-s -w" -o bin/vote .

run:
	@echo "==> Starting DevFlow Vote..."
	go run .

tidy:
	@echo "==> Tidying dependencies..."
	go mod tidy

test:
	@echo "==> Running tests..."
	go test -v -race ./...

clean:
	@echo "==> Cleaning build artifacts..."
	go clean
	rm -rf bin/ 2>/dev/null || true

docker-build:
	@echo "==> Building Docker image..."
	docker build -t $(DOCKER_IMAGE) .

docker-run:
	@echo "==> Running Vote container..."
	docker run -p 5007:5007 --env-file .env $(DOCKER_IMAGE)
