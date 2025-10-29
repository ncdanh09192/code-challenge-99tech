# DTO Structure - Problem 5 CRUD API

## Overview

This document explains the Data Transfer Objects (DTOs) used in the CRUD API server. DTOs provide a standardized contract between client and server for request/response handling.

## File Structure

```
src/
├── dtos/
│   └── user.dto.ts          # All DTOs definition
├── utils/
│   └── validation.ts        # DTO validation functions
└── routes/
    └── users.ts             # Routes using DTOs
```

---

## Request DTOs

### CreateUserDTO
Used for creating a new user (POST /users)

```typescript
interface CreateUserDTO {
    name: string;           // Required, non-empty string
    email: string;          // Required, valid email format
    age: number;            // Required, integer 0-150
}
```

**Example Request:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
}
```

---

### UpdateUserDTO
Used for updating a user (PUT /users/:id)

```typescript
interface UpdateUserDTO {
    name?: string;          // Optional, non-empty string
    email?: string;         // Optional, valid email format
    age?: number;           // Optional, integer 0-150
}
```

**Example Request:**
```json
{
    "name": "Jane Doe",
    "age": 31
}
```

**Note:** At least one field must be provided for update to work.

---

### ListUsersQueryDTO
Used for filtering and paginating users (GET /users)

```typescript
interface ListUsersQueryDTO {
    name?: string;          // Optional, filter by name (partial match)
    email?: string;         // Optional, filter by email (partial match)
    minAge?: number;        // Optional, filter by minimum age
    maxAge?: number;        // Optional, filter by maximum age
    limit?: number;         // Optional, results per page (default: 10, max: 100)
    offset?: number;        // Optional, results to skip (default: 0)
}
```

**Example Query String:**
```
GET /users?name=John&minAge=25&maxAge=35&limit=20&offset=0
```

---

## Response DTOs

### UserResponseDTO
Standard response format for user data

```typescript
interface UserResponseDTO {
    id: string;             // Unique user ID (UUID)
    name: string;           // User's name
    email: string;          // User's email
    age: number;            // User's age
    createdAt: string;      // ISO 8601 timestamp
    updatedAt: string;      // ISO 8601 timestamp
}
```

**Example Response:**
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "createdAt": "2025-10-29T12:00:00.000Z",
    "updatedAt": "2025-10-29T12:00:00.000Z"
}
```

---

### ApiSuccessResponse<T>
Generic success response wrapper

```typescript
interface ApiSuccessResponse<T> {
    success: true;          // Always true for success
    data?: T;               // Response data (optional)
    message?: string;       // Optional message
    pagination?: {          // Optional, included in list responses
        total: number;      // Total items in database
        limit: number;      // Items per page
        offset: number;     // Items skipped
        hasMore: boolean;   // More items available?
    }
}
```

**Example Success Response:**
```json
{
    "success": true,
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30,
        "createdAt": "2025-10-29T12:00:00.000Z",
        "updatedAt": "2025-10-29T12:00:00.000Z"
    }
}
```

---

### ApiErrorResponse
Generic error response wrapper

```typescript
interface ApiErrorResponse {
    success: false;         // Always false for error
    error: string;          // Human-readable error message
    details?: string;       // Optional technical details
    code?: string;          // Optional error code
}
```

**Example Error Response:**
```json
{
    "success": false,
    "error": "Validation failed",
    "details": "name: Name is required and must be a non-empty string; age: Age must be a number",
    "code": "VALIDATION_ERROR"
}
```

---

### PaginationDTO
Pagination metadata included in list responses

```typescript
interface PaginationDTO {
    total: number;          // Total items in database
    limit: number;          // Items per page requested
    offset: number;         // Items skipped
    hasMore: boolean;       // Whether more items exist
}
```

---

## Validation

All DTOs are validated using functions in `src/utils/validation.ts`:

### validateCreateUserDTO()
Validates create request data

```typescript
const result = validateCreateUserDTO(req.body);
if (!result.isValid) {
    // result.errors contains validation errors
}
```

### validateUpdateUserDTO()
Validates update request data

```typescript
const result = validateUpdateUserDTO(req.body);
if (!result.isValid) {
    // result.errors contains validation errors
}
```

### validateListUsersQueryDTO()
Validates query parameters

```typescript
const result = validateListUsersQueryDTO(req.query);
if (!result.isValid) {
    // result.errors contains validation errors
}
```

---

## API Endpoint Examples

### POST /users - Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":30}'
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30,
        "createdAt": "2025-10-29T12:00:00.000Z",
        "updatedAt": "2025-10-29T12:00:00.000Z"
    }
}
```

---

### GET /users/:id - Get User
```bash
curl http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30,
        "createdAt": "2025-10-29T12:00:00.000Z",
        "updatedAt": "2025-10-29T12:00:00.000Z"
    }
}
```

---

### GET /users - List Users
```bash
curl "http://localhost:3000/users?name=John&minAge=25&limit=10&offset=0"
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "John Doe",
            "email": "john@example.com",
            "age": 30,
            "createdAt": "2025-10-29T12:00:00.000Z",
            "updatedAt": "2025-10-29T12:00:00.000Z"
        }
    ],
    "pagination": {
        "total": 1,
        "limit": 10,
        "offset": 0,
        "hasMore": false
    }
}
```

---

### PUT /users/:id - Update User
```bash
curl -X PUT http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"age":31}'
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 31,
        "createdAt": "2025-10-29T12:00:00.000Z",
        "updatedAt": "2025-10-29T12:00:00.000Z"
    }
}
```

---

### DELETE /users/:id - Delete User
```bash
curl -X DELETE http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
    "success": true,
    "message": "User deleted successfully"
}
```

---

## Benefits of Using DTOs

1. **Type Safety**: TypeScript enforces types at compile time
2. **Validation**: Centralized validation logic reduces errors
3. **Documentation**: DTOs serve as API contract documentation
4. **Consistency**: All endpoints follow same response format
5. **Maintainability**: Easy to update structure across all endpoints
6. **Reusability**: DTOs can be exported for client-side use

---

## Error Response Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `USER_NOT_FOUND` | User with ID doesn't exist | 404 |
| `EMAIL_DUPLICATE` | Email already exists in database | 409 |
| `SERVER_ERROR` | Unexpected server error | 500 |

---

## Testing DTOs

All DTOs are tested in `src/__tests__/routes.test.ts` with:
- Valid inputs
- Invalid inputs (missing required fields)
- Type errors (wrong data types)
- Edge cases (empty strings, negative numbers, etc.)
- Boundary tests (max age 150, max limit 100)
