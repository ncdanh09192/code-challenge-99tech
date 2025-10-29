# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the **99Tech Code Challenge #1** repository - a coding challenge submission containing multiple problems that need to be solved.

**Repository**: `https://github.com/ncdanh09192/code-challenge-99tech`

## Project Structure

```
src/
├── problem1/              # Empty folder
├── problem2/              # Swap Form (HTML/CSS/JS)
├── problem3/              # Empty folder
├── problem4/              # Palindrome Checker (TypeScript)
│   ├── README.md
│   └── index.ts
├── problem5/              # CRUD API (Node.js/Express)
│   ├── README.md
│   ├── Makefile
│   ├── package.json
│   └── src/
├── problem6/              # Real-time Leaderboard (Docker)
│   ├── README.md
│   ├── Makefile
│   ├── docker-compose.yml
│   ├── package.json
│   ├── public/
│   └── src/
```

## Problems Status

- **Problem 1**: Not started (empty folder)
- **Problem 2**: Started - HTML/CSS layout for swap form, JavaScript needs implementation
- **Problem 3**: Not started (empty folder)
- **Problem 4**: ✅ Completed - Palindrome Checking Algorithm
- **Problem 5**: ✅ Completed - Backend CRUD API Server
- **Problem 6**: ✅ Completed - Real-time Leaderboard System

## Problem 2 Details

The form (`src/problem2/`) is a swap interface with:
- **Input field**: "Amount to send"
- **Output field**: "Amount to receive"
- **Button**: "CONFIRM SWAP"

The HTML and CSS are provided. The `script.js` file is empty and needs to be populated with the swap calculation logic.

## Development

### Tech Stack
- **HTML5** - Form structure
- **CSS3** - Styling and layout (flexbox)
- **JavaScript** - Form logic and interactivity

### No Build/Test Configuration
This is a vanilla frontend project with no build tools, package managers, or test runners configured.

### Running the Project
Open `src/problem2/index.html` directly in a browser to test the form.

## Problem 5 (Backend CRUD Server)

### Tech Stack
- **Node.js/TypeScript** - Backend runtime and language
- **ExpressJS** - HTTP server framework
- **SQLite3** - Database for persistence
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library

### Running the Server

**Quick Start (Recommended)** - One command setup and run:
```bash
cd src/problem5
make start
```

**Using Make Commands**:
```bash
make help         # Show all available commands
make start        # Install + build + run (RECOMMENDED)
make setup        # Install + build (if you want control)
make run          # Server + tests in parallel
make dev          # Server only
make test         # Tests only
```

**Manual Setup**:
```bash
cd src/problem5
npm install
npm run dev       # Start server

# In another terminal:
npm test          # Run tests
```

### Key Scripts
- `npm run dev` - Development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server
- `npm test` - Run test suite
- `npm run typecheck` - Check TypeScript types

### Test Coverage
- **40+ database operation tests** - CRUD operations, filters, pagination
- **50+ API endpoint tests** - HTTP routes, validation, error handling
- **Full CRUD coverage** - Create, Read, List, Update, Delete
- **Edge cases & error scenarios** - Invalid inputs, duplicates, not found errors

See `src/problem5/TESTING.md` for detailed test documentation.

## Problem 4 (Palindrome Checking)

### Quick Start
```bash
cd src/problem4
npx ts-node index.ts
```

### Description
Palindrome checking algorithm with multiple methods (simple string reversal, two-pointer approach, recursive method).

### Tech Stack
- **TypeScript** - Type-safe implementation

---

## Problem 6 (Real-time Leaderboard System)

### Quick Start
```bash
cd src/problem6
make start
```

### Description
Production-ready leaderboard system with:
- Redis Sorted Set caching for top 10 scores
- Real-time WebSocket updates
- JWT authentication
- Docker Compose deployment
- Interactive frontend dashboard

### Features
- 6 REST API endpoints
- 95% cache hit rate (3-6x performance improvement)
- WebSocket for real-time updates
- Idempotency protection
- SQLite database

### Running & Testing
```bash
make start          # Start services (easiest)
make test           # Run tests
make logs           # View logs
make stop           # Stop services
make help           # View all commands
```

**Access**: `http://localhost:8000`

### Documentation
See `src/problem6/README.md` for detailed architecture and configuration.

---

## Git Configuration

User email configured for this repo: `ncdanh09192@gmail.com`

To push changes:
```bash
git add .
git commit -m "message"
git push
```

## Important Notes

- The README states: "It is important that you minimally attempt the problems, even if you do not arrive at a working solution."
- Solutions can be submitted via link to this repository, attached files, or preferred method
