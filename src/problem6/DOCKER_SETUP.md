# Docker Setup - Live Scoreboard System

All services run inside Docker containers. No local Node.js or Redis installation needed!

## Quick Start

```bash
# Start everything (builds images if needed, starts containers)
make start

# Server runs at http://localhost:3000
# Redis runs at localhost:6379
# WebSocket available at ws://localhost:3000
```

## Available Commands

### Running Services
```bash
make start              # Start app + Redis containers
make stop               # Stop all containers
make restart            # Restart containers
make logs               # View live logs from app
make ps                 # Show running containers
make status             # Check container health
```

### Testing (runs inside container)
```bash
make test               # Run test suite once
make test-watch         # Run tests in watch mode
make test-coverage      # Run tests with coverage report
```

### Building
```bash
make build              # Build Docker images
make rebuild            # Rebuild from scratch (no cache)
make clean              # Stop containers and remove volumes
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Docker Network                  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │   scoreboard-app (Node.js)      │  │
│  │   - Port 3000 → localhost:3000  │  │
│  │   - Runs: npm run build && npm  │  │
│  │           run start             │  │
│  │   - Depends on: Redis (healthy) │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │   scoreboard-redis (Redis 7)    │  │
│  │   - Port 6379 → localhost:6379  │  │
│  │   - Volume: redis_data          │  │
│  │   - Healthcheck: redis-cli ping │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │   Volumes                       │  │
│  │   - redis_data (Redis persist)  │  │
│  │   - ./scoreboard.db (SQLite)    │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## How It Works

### 1. **Container Communication**
- App container uses service name `redis` as hostname
- Docker DNS automatically resolves `redis:6379` to the Redis container
- No manual IP configuration needed

### 2. **Startup Flow**
1. `docker-compose up -d` starts services
2. Redis starts first with healthcheck
3. App waits for Redis healthcheck to pass (depends_on condition)
4. App builds TypeScript and starts server
5. Both containers have healthchecks

### 3. **Data Persistence**
- **Redis**: Volume `redis_data` persists data
- **SQLite**: Volume `./scoreboard.db` persists database
- Both survive container restarts

### 4. **Logging**
- `make logs` shows live logs from app container
- All console.log and error messages visible

---

## Testing Inside Docker

### Run tests once
```bash
make test
# Output: Full test suite results
```

### Run tests in watch mode
```bash
make test-watch
# Output: Tests re-run on file changes
# Note: Watch mode works with mounted volumes
```

### Run with coverage
```bash
make test-coverage
# Output: Coverage report in terminal
```

---

## Troubleshooting

### Check if containers are running
```bash
make ps
```

### View detailed logs
```bash
make logs
```

### Check health status
```bash
make status
# Shows container status + test connectivity to /health endpoint
```

### Clean slate (remove everything)
```bash
make clean
# Stops containers and removes volumes
# Then: make start to start fresh
```

### Can't connect to http://localhost:3000
1. Check containers are running: `make ps`
2. Check logs: `make logs`
3. Wait a moment (app might still be starting)
4. Restart: `make restart`

### Redis connection error in logs
- Wait ~10 seconds for Redis to fully start
- Redis has healthcheck but app connects immediately
- If persistent, check: `docker-compose logs redis`

---

## Development Workflow

```bash
# 1. Start services
make start

# 2. Make code changes (mounted, but need rebuild)
# Edit src/routes.ts, etc.

# 3. Rebuild containers
make restart

# 4. Check logs
make logs

# 5. Run tests
make test

# 6. When done
make stop
```

---

## Production Deployment

For production use:
1. Update environment variables in docker-compose.yml
2. Use external Redis (managed service)
3. Add reverse proxy (Nginx/HAProxy)
4. Use Docker registry for images
5. Deploy with Kubernetes/Docker Swarm

```bash
# For local testing before deploy
make rebuild  # Clean build
make start    # Start services
make test     # Verify all tests pass
```

---

## API Access

### From inside containers
- App can access Redis at: `redis:6379`
- No external port needed for internal communication

### From your machine
- App: http://localhost:3000
- Redis CLI: `redis-cli -h localhost -p 6379`
- WebSocket: `ws://localhost:3000/ws/scoreboard`

---

## Files Reference

- `Dockerfile` - App container image definition
- `docker-compose.yml` - Services orchestration
- `Makefile` - Docker command shortcuts
- `.dockerignore` - Files excluded from Docker build
- `.env.example` - Environment variables template
