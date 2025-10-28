# Problem 5: A Crude Server - CRUD API with ExpressJS

A simple backend server built with **ExpressJS**, **TypeScript**, and **SQLite** that provides CRUD operations for managing users.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Example Usage](#example-usage)

## ✨ Features

- **Create** - Add new users to the database
- **Read** - Retrieve user details by ID
- **List** - View all users with advanced filtering and pagination
- **Update** - Modify user information
- **Delete** - Remove users from the database
- **Filtering** - Filter users by name, email, and age range
- **Pagination** - Support for limit and offset pagination
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Comprehensive error responses
- **Data Persistence** - SQLite database storage

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: ExpressJS (^4.18.2)
- **Language**: TypeScript (^5.0.0)
- **Database**: SQLite3 (^5.1.6)
- **Utilities**: UUID (^9.0.0)
- **Development**: ts-node, TypeScript compiler

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm
- Basic knowledge of REST APIs

### Steps

1. **Navigate to the problem5 directory**:
   ```bash
   cd src/problem5
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify installation**:
   ```bash
   npm run typecheck
   ```

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file in the `problem5` directory to customize settings:

```env
PORT=3000
```

Default: `PORT=3000`

### Database

- **Type**: SQLite3
- **Location**: `users.db` (created automatically in the problem5 directory)
- **Schema**: Single `users` table with auto-creation on startup

## 🚀 Running the Application

### Quick Start (Recommended)

**One command to install, build, run server, and test:**

```bash
make start
```

This will:
- ✅ Install dependencies
- ✅ Build TypeScript
- ✅ Start development server
- ✅ Run all 90+ tests in parallel

See [QUICKSTART.md](./QUICKSTART.md) for more details.

### Using Make Commands

View all available commands:

```bash
make help
```

Common commands:

```bash
# Recommended (first time)
make start              # Install deps, build, run server + tests

# Development
make dev                # Run server only
make test               # Run tests once
make test-watch         # Run tests in watch mode
make test-coverage      # Generate coverage report

# Setup
make setup              # Install + build (if you want manual control)
make run                # Run server + tests in parallel

# Clean
make clean              # Remove node_modules, build, and database
```

### Manual Setup (Without Makefile)

If you prefer to run commands manually:

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run development server
npm run dev

# In another terminal, run tests
npm test
```

### Testing

Run the comprehensive test suite with 90+ unit and integration tests:

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Tests cover:
- ✅ All CRUD operations (Create, Read, List, Update, Delete)
- ✅ Input validation and error handling
- ✅ Filtering and pagination
- ✅ Database operations
- ✅ API endpoint responses

See [TESTING.md](./TESTING.md) for detailed test documentation.

### Type Checking

Verify TypeScript types without building:

```bash
npm run typecheck
```

Or with make:

```bash
make typecheck
```

### Production Mode

Build and run:

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Health Check
**GET** `/health`

Check server status.

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T10:00:00.000Z"
}
```

---

#### 2. Create User
**POST** `/api/users`

Create a new user.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

**Validation Rules**:
- `name` (required): String, non-empty
- `email` (required): Valid email format, must be unique
- `age` (required): Non-negative integer

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "createdAt": "2025-10-28T10:00:00.000Z",
    "updatedAt": "2025-10-28T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Missing or invalid fields
- `409 Conflict` - Email already exists

---

#### 3. List Users
**GET** `/api/users`

List all users with optional filters and pagination.

**Query Parameters** (all optional):
- `name` - Filter by name (partial match, case-sensitive)
- `email` - Filter by email (partial match, case-sensitive)
- `minAge` - Filter by minimum age (inclusive)
- `maxAge` - Filter by maximum age (inclusive)
- `limit` - Results per page (default: 10, max: 100)
- `offset` - Number of results to skip (default: 0)

**Example**:
```
GET /api/users?name=John&minAge=25&maxAge=40&limit=20&offset=0
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "createdAt": "2025-10-28T10:00:00.000Z",
      "updatedAt": "2025-10-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

---

#### 4. Get User Details
**GET** `/api/users/:id`

Retrieve a specific user by ID.

**Parameters**:
- `id` (required): User ID (UUID format)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "createdAt": "2025-10-28T10:00:00.000Z",
    "updatedAt": "2025-10-28T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `404 Not Found` - User does not exist

---

#### 5. Update User
**PUT** `/api/users/:id`

Update user details.

**Parameters**:
- `id` (required): User ID (UUID format)

**Request Body** (at least one field required):
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 31
}
```

All fields are optional, but at least one must be provided.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "age": 31,
    "createdAt": "2025-10-28T10:00:00.000Z",
    "updatedAt": "2025-10-28T10:00:01.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - No fields to update or invalid values
- `404 Not Found` - User does not exist
- `409 Conflict` - Email already exists

---

#### 6. Delete User
**DELETE** `/api/users/:id`

Delete a user.

**Parameters**:
- `id` (required): User ID (UUID format)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses**:
- `404 Not Found` - User does not exist

---

## 💡 Example Usage

### Using cURL

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "age": 28
  }'

# 3. List all users
curl http://localhost:3000/api/users

# 4. List with filters
curl "http://localhost:3000/api/users?minAge=25&maxAge=35&limit=10"

# 5. Get specific user (replace ID with actual user ID)
curl http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000

# 6. Update user
curl -X PUT http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "age": 29
  }'

# 7. Delete user
curl -X DELETE http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000
```

### Using JavaScript/Fetch

```javascript
// Create a user
const createUser = async () => {
  const response = await fetch('http://localhost:3000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bob Johnson',
      email: 'bob@example.com',
      age: 35
    })
  });
  const data = await response.json();
  console.log(data);
};

// List users with filters
const listUsers = async () => {
  const response = await fetch(
    'http://localhost:3000/api/users?minAge=25&maxAge=40&limit=10'
  );
  const data = await response.json();
  console.log(data);
};

// Get user details
const getUser = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}`);
  const data = await response.json();
  console.log(data);
};

// Update user
const updateUser = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ age: 36 })
  });
  const data = await response.json();
  console.log(data);
};

// Delete user
const deleteUser = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  console.log(data);
};
```

---

## 📂 Project Structure

```
src/problem5/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── database.ts           # Database setup and operations
│   ├── routes/
│   │   └── users.ts          # CRUD endpoints
│   └── types/
│       └── user.ts           # TypeScript interfaces
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── README.md                 # This file
└── users.db                  # SQLite database (auto-created)
```

---

## 🔍 Implementation Details

### Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  age INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

### Key Features

1. **UUID for IDs**: Each user gets a unique UUID identifier
2. **Email Uniqueness**: Database enforces unique email constraint
3. **Timestamps**: `createdAt` and `updatedAt` track record lifecycle
4. **Filtering**: Advanced query support for name, email, and age ranges
5. **Pagination**: Support for limit/offset based pagination
6. **Error Handling**: Detailed error messages for debugging
7. **Type Safety**: Full TypeScript for compile-time type checking

---

## ⚠️ Limitations & Notes

1. **SQLite Limitations**: SQLite is single-file based and not ideal for large-scale applications
2. **Concurrent Writes**: SQLite handles concurrent reads well but sequential writes are safer
3. **No Authentication**: This API is public with no authentication/authorization
4. **No Rate Limiting**: Consider adding rate limiting for production use
5. **No Input Sanitization**: For production, add additional input validation and sanitization

---

## 🚀 Next Steps for Production

To make this production-ready, consider:

1. Add authentication (JWT, OAuth)
2. Add input validation library (joi, zod)
3. Implement rate limiting (express-rate-limit)
4. Add logging (winston, pino)
5. Add CORS support
6. Switch to PostgreSQL or MongoDB for scalability
7. Add API documentation (Swagger/OpenAPI)
8. Add comprehensive test suite
9. Add containerization (Docker)
10. Add CI/CD pipeline

---

## 📝 Notes

- This is a simplified CRUD server for educational purposes
- All data is stored locally in SQLite
- The database file (`users.db`) will be created automatically on first run
- No external services or complex dependencies required
