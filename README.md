# 99Tech Code Challenge #1

Repository containing solutions for 99Tech Code Challenge problems.

Note: If you fork this repository, your responses may be publicly linked to this repo.

---

## 🚀 Quickest Setup (Recommended)

```bash
# Clone repository
git clone <repo-url>
cd code-challenge-99tech

# Run interactive setup script (choose problem from menu)
bash setup.sh
```

The script will:
1. Show a menu to select Problem 4, 5, or 6
2. Install dependencies automatically
3. Start the selected problem
4. Display access URLs

**Requirements**: Node.js 18+ (Docker required for Problem 6)

---

## Manual Quick Start Guide

### Problem 4 - Three Ways to Sum to n

```bash
cd src/problem4
npx ts-node index.ts
```

**Tech**: TypeScript | **Purpose**: Sum calculation using 3 different approaches (Loop, Array.reduce, Recursive)

---

### Problem 5 - CRUD API Server

```bash
cd src/problem5

# Option 1: One-command setup (recommended)
make start

# Option 2: Manual setup
npm install
npm run dev          # Terminal 1
npm test             # Terminal 2
```

**Tech**: Node.js, Express, SQLite | **Purpose**: RESTful CRUD API with 90+ tests

**Features**:
- Full CRUD operations
- Pagination & filtering
- Input validation
- Comprehensive test suite (90+ tests)

**Endpoints**: http://localhost:3000

---

### Problem 6 - Real-time Leaderboard System

```bash
cd src/problem6

# Start with Docker Compose (recommended)
make start

# Run tests
make test

# View logs
make logs

# Stop services
make stop

# See all commands
make help
```

**Tech**: Node.js, Express, Redis, SQLite, Docker, WebSocket | **Purpose**: Production-ready leaderboard

**Features**:
- Redis Sorted Set caching (50-100x faster)
- Real-time WebSocket updates
- JWT authentication
- 6 REST API endpoints
- Interactive frontend dashboard
- Docker container orchestration

**Access**: http://localhost:8000

---

## Running All Problems

```bash
# Problem 4
cd src/problem4 && npx ts-node index.ts

# Problem 5
cd src/problem5 && make start

# Problem 6
cd src/problem6 && make start
```

---

## Documentation

- **CLAUDE.md** - Detailed project structure and setup guide
- **Problem 4**: `src/problem4/README.md`
- **Problem 5**: `src/problem5/README.md` (with QUICKSTART.md, TESTING.md)
- **Problem 6**: `src/problem6/README.md` (with architecture & Docker guide)

---

## Submission

You can either provide a link to this repository, attach the solution files, or use your preferred method. We're cool as long as we can view your solution without any hassle.
