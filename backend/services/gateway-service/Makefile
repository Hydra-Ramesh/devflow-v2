.PHONY: all build run test clean docker-build docker-run tidy

APP_NAME = gateway-service-v2
DOCKER_IMAGE = devflow/gateway-service:v2

all: build

build:
	@echo "==> Building Gateway binary..."
	go build -ldflags="-s -w" -o bin/gateway ./cmd/gateway

run:
	@echo "==> Starting DevFlow Gateway v2..."
	go run ./cmd/gateway

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
	@echo "==> Running Gateway container..."
	docker run -p 5000:5000 --env-file .env $(DOCKER_IMAGE)
