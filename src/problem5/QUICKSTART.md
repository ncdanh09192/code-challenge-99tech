# Quick Start Guide - CRUD Server

Get the server up and running in seconds!

## One-Command Setup (Recommended)

After cloning the repository:

```bash
cd src/problem5
make start
```

That's it! This single command will:
1. ✅ Install all dependencies
2. ✅ Build TypeScript
3. ✅ Start the development server
4. ✅ Run all tests

You'll see the server running at `http://localhost:3000` with tests executing in parallel.

---

## Step-by-Step Setup (Alternative)

If you prefer more control:

```bash
# Step 1: Navigate to project
cd src/problem5

# Step 2: Install dependencies (one time)
make setup

# Step 3: Start server + run tests
make run
```

Or simply:
```bash
make start  # Same as the above steps combined
```

---

## Available Commands

Use `make help` to see all available commands:

```bash
make help
```

Common commands:

```bash
# Development
make dev              # Start server only
make test             # Run tests once
make test-watch       # Run tests in watch mode

# Rebuild after changes
make build            # Rebuild TypeScript

# Full cleanup
make clean            # Remove all generated files

# Quick reference
make init             # Setup + run (first time)
make run              # Server + tests in parallel
```

---

## First Run

```bash
$ cd src/problem5
$ make start

📝 Starting project...
📥 Installing dependencies...
npm install
... (npm output)
🏗️  Building TypeScript...
npm run build
... (build output)

🚀 Starting server and running tests...

🚀 Server running at http://localhost:3000
📚 API Documentation:
   - GET    /health              - Health check
   - POST   /api/users            - Create user
   - GET    /api/users            - List users (with filters)
   - GET    /api/users/:id        - Get user details
   - PUT    /api/users/:id        - Update user
   - DELETE /api/users/:id        - Delete user

PASS  src/__tests__/database.test.ts
PASS  src/__tests__/routes.test.ts

Test Suites: 2 passed, 2 total
Tests:       90+ passed, 90+ total
```

---

## Running Tests Only (Server Already Running)

In a separate terminal:

```bash
cd src/problem5

# Run tests once
make test

# Run tests in watch mode (auto-rerun on changes)
make test-watch

# Generate coverage report
make test-coverage
```

---

## Running Server Only

If you want to develop without running tests:

```bash
cd src/problem5

# Just start the server
make dev

# Server output:
# 🚀 Server running at http://localhost:3000
```

---

## Testing the API

Once the server is running, test it with curl:

```bash
# Health check
curl http://localhost:3000/health

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'

# List all users
curl http://localhost:3000/api/users

# Get specific user
curl http://localhost:3000/api/users/{user-id}

# Update user
curl -X PUT http://localhost:3000/api/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{"age": 31}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/{user-id}
```

---

## Troubleshooting

### "make: command not found"
- On macOS: `make` should be pre-installed
- On Linux: `sudo apt-get install build-essential`
- On Windows: Install [MinGW](http://www.mingw.org/) or use [WSL](https://docs.microsoft.com/en-us/windows/wsl/)

### "npm: command not found"
- Install [Node.js](https://nodejs.org/) which includes npm

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 make dev
```

### Tests failing after code changes
```bash
# Rebuild and test
make build
make test
```

### Start fresh
```bash
# Clean and reinstall everything
make clean
make init
```

---

## Project Structure

```
problem5/
├── src/
│   ├── index.ts              # Server entry point
│   ├── app.ts                # Express app factory
│   ├── database.ts           # Database operations
│   ├── routes/users.ts       # API endpoints
│   ├── types/user.ts         # TypeScript types
│   └── __tests__/            # Test files
├── Makefile                  # Build commands
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── jest.config.js            # Jest config
├── README.md                 # Full documentation
├── TESTING.md                # Testing details
└── QUICKSTART.md             # This file
```

---

## Next Steps

After getting the server running:

1. **Explore the API**: Use the curl examples above
2. **Read the docs**: See [README.md](./README.md)
3. **Learn about tests**: See [TESTING.md](./TESTING.md)
4. **Make changes**: Edit files and see tests auto-rerun

---

## Environment Variables

Optional environment variables:

```bash
# Set port (default: 3000)
PORT=3001 make run

# Or create a .env file
echo "PORT=3001" > .env
make run
```

---

## Need Help?

- **API Documentation**: See [README.md](./README.md)
- **Testing Guide**: See [TESTING.md](./TESTING.md)
- **See all commands**: Run `make help`

---

**That's it! Happy coding! 🚀**
