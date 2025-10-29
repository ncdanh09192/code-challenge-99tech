.PHONY: help install build dev test test-watch test-coverage typecheck setup run start init clean all

# Default target - show help
help:
	@echo ""
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║           CRUD Server - Available Commands                     ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🚀 Quick Start (First Time):"
	@echo "   make                    - Show this help message"
	@echo "   make start              - Install deps and run server + tests"
	@echo ""
	@echo "📦 Setup Commands (run once after cloning):"
	@echo "   make install            - Install npm dependencies"
	@echo "   make build              - Build TypeScript to JavaScript"
	@echo "   make setup              - Install dependencies and build"
	@echo ""
	@echo "🎯 Development Commands:"
	@echo "   make dev                - Run development server (port 3000)"
	@echo "   make test               - Run test suite once"
	@echo "   make test-watch         - Run tests in watch mode"
	@echo "   make test-coverage      - Run tests with coverage report"
	@echo "   make typecheck          - Check TypeScript types"
	@echo ""
	@echo "🔄 Combined Commands:"
	@echo "   make start              - Install + build + run server + tests (RECOMMENDED)"
	@echo "   make run                - Run server + tests in parallel"
	@echo ""
	@echo "🧹 Other Commands:"
	@echo "   make clean              - Remove node_modules, dist, and database"
	@echo "   make all                - Setup and run everything"
	@echo ""
	@echo "Example workflow:"
	@echo "   1. git clone <repo>"
	@echo "   2. cd src/problem5"
	@echo "   3. make start           # Install deps, build, run server + tests"
	@echo ""
	@echo "Or step by step:"
	@echo "   make setup              # First time setup"
	@echo "   make run                # Start server + tests (if already setup)"
	@echo ""

# Start - smart setup and run (first time)
start:
	@echo ""
	@echo "📝 Starting project..."
	@if [ ! -d "node_modules" ]; then \
		echo "📥 Installing dependencies..."; \
		npm install; \
		echo "🏗️  Building TypeScript..."; \
		npm run build; \
	else \
		echo "✓ Dependencies already installed"; \
	fi
	@echo ""
	@echo "🚀 Starting server and running tests..."
	@echo ""
	@echo "═══════════════════════════════════════════════════════════════"
	@echo "📚 API ENDPOINTS (RESTful CRUD Server)"
	@echo "═══════════════════════════════════════════════════════════════"
	@echo ""
	@echo "🌐 Base URL: http://localhost:3000"
	@echo ""
	@echo "CREATE (POST):"
	@echo "  POST /users              - Create new user"
	@echo "  Example: curl -X POST http://localhost:3000/users \\"
	@echo "    -H 'Content-Type: application/json' \\"
	@echo "    -d '{\"name\":\"John\",\"email\":\"john@example.com\"}'"
	@echo ""
	@echo "READ (GET):"
	@echo "  GET  /users              - Get all users (with pagination & filters)"
	@echo "  GET  /users/:id          - Get user by ID"
	@echo "  Example: curl http://localhost:3000/users"
	@echo "  Example: curl http://localhost:3000/users/1"
	@echo ""
	@echo "UPDATE (PUT):"
	@echo "  PUT  /users/:id          - Update user by ID"
	@echo "  Example: curl -X PUT http://localhost:3000/users/1 \\"
	@echo "    -H 'Content-Type: application/json' \\"
	@echo "    -d '{\"name\":\"Jane\"}'"
	@echo ""
	@echo "DELETE (DELETE):"
	@echo "  DELETE /users/:id        - Delete user by ID"
	@echo "  Example: curl -X DELETE http://localhost:3000/users/1"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  - Automated test suite running in parallel"
	@echo "  - 90+ test cases covering CRUD operations"
	@echo "  - See console output for test results"
	@echo ""
	@echo "📖 Full Documentation: See QUICKSTART.md and TESTING.md"
	@echo "═══════════════════════════════════════════════════════════════"
	@echo ""
	npm run dev:test

# Alias for backward compatibility
init: start

# Install dependencies
install:
	@echo "📥 Installing npm dependencies..."
	npm install
	@echo "✓ Installation complete!"

# Build TypeScript
build:
	@echo "🏗️  Building TypeScript..."
	npm run build
	@echo "✓ Build complete!"

# Development server
dev:
	@echo ""
	@echo "🚀 Starting development server..."
	@echo "📍 Server running at http://localhost:3000"
	@echo ""
	@echo "═══════════════════════════════════════════════════════════════"
	@echo "📚 API ENDPOINTS (RESTful CRUD Server)"
	@echo "═══════════════════════════════════════════════════════════════"
	@echo ""
	@echo "CREATE:  POST   /users              - Create new user"
	@echo "READ:    GET    /users              - Get all users (paginated)"
	@echo "         GET    /users/:id          - Get user by ID"
	@echo "UPDATE:  PUT    /users/:id          - Update user"
	@echo "DELETE:  DELETE /users/:id          - Delete user"
	@echo ""
	@echo "Quick Test:"
	@echo "  curl http://localhost:3000/users"
	@echo ""
	@echo "═══════════════════════════════════════════════════════════════"
	@echo ""
	npm run dev

# Run tests once
test:
	@echo "🧪 Running test suite..."
	npm test

# Run tests in watch mode
test-watch:
	@echo "👀 Running tests in watch mode..."
	npm run test:watch

# Run tests with coverage
test-coverage:
	@echo "📊 Running tests with coverage report..."
	npm run test:coverage

# TypeScript type checking
typecheck:
	@echo "🔍 Checking TypeScript types..."
	npm run typecheck

# Setup (install + build)
setup: install build
	@echo ""
	@echo "✓ Setup complete! Run 'make run' to start server + tests"

# Run server + tests in parallel
run:
	@echo ""
	@echo "🔄 Running server and tests in parallel..."
	@echo ""
	npm run dev:test

# Dev-test (alias for run)
dev-test:
	npm run dev:test

# Full setup and run
all: setup run

# Clean
clean:
	@echo "🧹 Cleaning up..."
	@rm -rf dist node_modules users.db
	@echo "✓ Clean complete!"
	@echo "Run 'make install' to reinstall dependencies"

.DEFAULT_GOAL := help
