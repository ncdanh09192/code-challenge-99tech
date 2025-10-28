# Postman Collection - Testing Guide

## Setup Instructions

### 1. Import Collection
- Open Postman
- Click `Import` → `Upload Files`
- Select `postman_collection.json`

### 2. Set Base URL
- Click on the collection name `Problem 5 - CRUD API`
- Go to `Variables` tab
- Set `baseUrl` = `http://localhost:3000` (should be pre-filled)

### 3. Start the Server
```bash
cd src/problem5
make start
```

## Recommended Test Workflow

### Phase 1: Health Check
Run this first to verify server is running:
1. **Health Status** - GET /health

### Phase 2: Create Users (Setup)
Create test data for subsequent tests. **Save user IDs**:
1. **Create User 1** - John Doe (john@example.com)
   - After response, copy the `data.id` value
   - Save as variable `userId1`

2. **Create User 2** - Jane Smith (jane@example.com)
   - After response, copy the `data.id` value
   - Save as variable `userId2`

3. **Create User 3** - Bob Johnson (bob@example.com)
   - After response, copy the `data.id` value
   - Save as variable `userId3`

### Phase 3: Create Error Cases
Test validation errors:
1. **Create User - Missing Fields** - Should fail with 400
2. **Create User - Invalid Email** - Should fail with 400
3. **Create User - Negative Age** - Should fail with 400
4. **Create User - Duplicate Email** - Should fail with 409 (use john@example.com again)

### Phase 4: Read Users
Test getting users:
1. **List All Users** - Should return all 3 users
2. **List Users - With Limit** - Should return 5 or fewer users
3. **List Users - With Offset** - Should return paginated results
4. **List Users - Filter by Name** - Search for "John"
5. **List Users - Filter by Email** - Search for "example.com"
6. **List Users - Filter by Age Range** - minAge=25, maxAge=35
7. **List Users - All Filters Combined** - Test multiple filters
8. **Get User by ID** - Use `{{userId1}}` variable
9. **Get User by ID - Not Found** - Use "nonexistent-id"

### Phase 5: Update Users
**IMPORTANT**: For duplicate email test:
1. First update **User 1** with User 2's email (jane@example.com) → Should fail with 409
   - Use `{{userId1}}` and set email to "jane@example.com" (which belongs to User 2)
2. **Update User - All Fields** - Update User 1 with new data
3. **Update User - Name Only** - Update only name
4. **Update User - Email Only** - Update to unique email
5. **Update User - Age Only** - Update only age
6. **Update User - No Fields** - Should fail with 400
7. **Update User - Invalid Email** - Should fail with 400
8. **Update User - Negative Age** - Should fail with 400
9. **Update User - User Not Found** - Should fail with 404

### Phase 6: Delete Users
Clean up test data:
1. **Delete User** - Delete User 3 (bob@example.com) using `{{userId3}}`
2. **Delete User - Not Found** - Try to delete same user again → Should fail with 404

## Setting Environment Variables in Postman

### Method 1: Manual (During Testing)
After creating a user, copy the `id` from response:
```json
{
  "success": true,
  "data": {
    "id": "12345-67890-abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    ...
  }
}
```

Click on the collection, go to `Variables` tab, and update:
- `userId1` = `12345-67890-abcde`
- `userId2` = (second user's id)
- `userId3` = (third user's id)

### Method 2: Using Tests (Automated)
In Postman, you can add post-request scripts. Add this to "Create User - Success":

```javascript
if (pm.response.code === 201) {
    const responseData = pm.response.json();
    pm.environment.set("userId1", responseData.data.id);
}
```

## Expected Results Summary

| Test | Method | Expected Status | Notes |
|------|--------|-----------------|-------|
| Health Check | GET | 200 | Server is running |
| Create User (valid) | POST | 201 | Returns user with ID |
| Create User (duplicate email) | POST | 409 | Email already exists |
| Create User (invalid email) | POST | 400 | Invalid email format |
| Create User (negative age) | POST | 400 | Age validation error |
| List Users | GET | 200 | Returns array with pagination |
| Get User by ID | GET | 200 | Returns single user |
| Get User by ID (not found) | GET | 404 | User not found |
| Update User (valid) | PUT | 200 | Returns updated user |
| Update User (duplicate email) | PUT | 409 | Email already exists |
| Update User (not found) | PUT | 404 | User not found |
| Update User (no fields) | PUT | 400 | At least one field required |
| Delete User | DELETE | 200 | User deleted successfully |
| Delete User (not found) | DELETE | 404 | User not found |

## Troubleshooting

### Test Returns 200 Instead of Expected Error
- Check if you're using the correct test case
- For duplicate email update: Make sure you have 2 users created first
- For update non-existent user: Use "nonexistent-id" or a valid ID that was deleted

### {{userId}} Variable Not Working
- Click on the collection name
- Go to `Variables` tab
- Make sure `userId` is set with a valid user ID from a create response

### Tests Keep Failing
- Ensure server is running: `make start`
- Check server logs for error messages
- Verify database file exists: `ls -la src/problem5/users.db`
- Reset everything: `make clean && make start`
