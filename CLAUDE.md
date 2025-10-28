# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the **99Tech Code Challenge #1** repository - a coding challenge submission containing multiple problems that need to be solved.

**Repository**: `https://github.com/ncdanh09192/code-challenge-99tech`

## Project Structure

```
src/
├── problem1/        # Problem 1 solution (.keep file - needs implementation)
├── problem2/        # Problem 2 solution (Fancy Form - HTML/CSS/JS swap form)
│   ├── index.html   # Form UI with input fields
│   ├── script.js    # JavaScript logic (currently empty)
│   └── style.css    # Basic styling
├── problem3/        # Problem 3 solution (.keep file - needs implementation)
├── problem4/        # Problem 4 solution (.keep file - needs implementation)
└── problem5/        # Problem 5 solution (.keep file - needs implementation)
```

## Problems Status

- **Problem 1**: Not started (empty folder)
- **Problem 2**: Started - HTML/CSS layout for swap form, JavaScript needs implementation
- **Problem 3**: Not started (empty folder)
- **Problem 4**: Not started (empty folder)
- **Problem 5**: Not started (empty folder)

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
