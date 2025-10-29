.PHONY: help start stop logs test build clean rebuild ps status health

# Default target
help:
	@echo ""
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║   Live Scoreboard System (Docker) - Available Commands         ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "   make start              - Start app & Redis containers"
	@echo "   make stop               - Stop all containers"
	@echo "   make restart            - Restart containers"
	@echo "   make logs               - View application logs"
	@echo "   make ps                 - Show running containers"
	@echo "   make status             - Check container health"
	@echo ""
	@echo "🧪 Testing (inside container):"
	@echo "   make test               - Run test suite once"
	@echo "   make test-watch         - Run tests in watch mode"
	@echo "   make test-coverage      - Run tests with coverage"
	@echo ""
	@echo "🔨 Building:"
	@echo "   make build              - Build Docker images"
	@echo "   make rebuild            - Rebuild images from scratch"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "   make clean              - Stop containers and remove volumes"
	@echo ""
	@echo "📍 Access:"
	@echo "   App:      http://localhost:8000"
	@echo "   Redis:    localhost:6379"
	@echo "   WebSocket: ws://localhost:8000"
	@echo ""

# Start containers
start:
	@echo ""
	@echo "🚀 Starting Live Scoreboard System..."
	@echo ""
	docker-compose up -d
	@echo ""
	@echo "✅ Services started:"
	@echo "   - App:   http://localhost:8000"
	@echo "   - Redis: localhost:6379"
	@echo ""
	@echo "📝 Waiting for services to be healthy..."
	@sleep 5
	@echo "✓ Ready!"

# Stop containers
stop:
	@echo "🛑 Stopping containers..."
	docker-compose down
	@echo "✓ Containers stopped"

# Restart containers
restart: stop start

# View logs
logs:
	docker-compose logs -f app

# Show running containers
ps:
	@echo "📦 Running containers:"
	@docker-compose ps

# Check container health
status:
	@echo "🏥 Container health status:"
	@docker-compose ps
	@echo ""
	@echo "Testing connectivity..."
	@curl -s http://localhost:8000/health | jq '.' || echo "App not ready yet"

# Run tests
test:
	@echo "🧪 Running tests inside container..."
	docker-compose exec -T app npm test

test-watch:
	@echo "👀 Running tests in watch mode..."
	docker-compose exec app npm run test:watch

test-coverage:
	@echo "📊 Running tests with coverage..."
	docker-compose exec -T app npm run test:coverage

# Build images
build:
	@echo "🏗️  Building Docker images..."
	docker-compose build

rebuild:
	@echo "🔄 Rebuilding Docker images from scratch..."
	docker-compose build --no-cache

# Clean up
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	@echo "✓ Containers and volumes removed"

.DEFAULT_GOAL := help
