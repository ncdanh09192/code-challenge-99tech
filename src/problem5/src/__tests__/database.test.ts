/**
 * Unit tests for database operations
 */

import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import {
    initializeDatabase,
    createUser,
    getUserById,
    listUsers,
    updateUser,
    deleteUser,
} from '../database';
import { CreateUserRequest, UpdateUserRequest } from '../types/user';

// Use a test database file
const TEST_DB = ':memory:'; // In-memory database for tests

let db: sqlite3.Database;

// Setup and teardown
beforeAll(async () => {
    db = await new Promise((resolve, reject) => {
        const testDb = new sqlite3.Database(TEST_DB, (err) => {
            if (err) reject(err);
            else resolve(testDb);
        });
    });

    // Create table manually for testing
    await new Promise((resolve, reject) => {
        db.run(
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                age INTEGER NOT NULL,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            )`,
            (err) => {
                if (err) reject(err);
                else resolve(undefined);
            }
        );
    });
});

afterAll((done) => {
    db.close(done);
});

// Clear table before each test
beforeEach((done) => {
    db.run('DELETE FROM users', done);
});

describe('Database Operations', () => {
    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const userData: CreateUserRequest = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30,
            };

            const user = await createUser(db, userData);

            expect(user.id).toBeDefined();
            expect(user.name).toBe('John Doe');
            expect(user.email).toBe('john@example.com');
            expect(user.age).toBe(30);
            expect(user.createdAt).toBeDefined();
            expect(user.updatedAt).toBeDefined();
        });

        it('should create multiple users with unique IDs', async () => {
            const user1 = await createUser(db, {
                name: 'Alice',
                email: 'alice@example.com',
                age: 25,
            });

            const user2 = await createUser(db, {
                name: 'Bob',
                email: 'bob@example.com',
                age: 28,
            });

            expect(user1.id).not.toBe(user2.id);
            expect(user1.email).not.toBe(user2.email);
        });

        it('should reject duplicate email addresses', async () => {
            await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            await expect(
                createUser(db, {
                    name: 'Jane',
                    email: 'john@example.com', // Duplicate email
                    age: 28,
                })
            ).rejects.toThrow();
        });

        it('should set createdAt and updatedAt timestamps', async () => {
            const beforeCreate = new Date();
            const user = await createUser(db, {
                name: 'Test User',
                email: 'test@example.com',
                age: 30,
            });
            const afterCreate = new Date();

            const createdAt = new Date(user.createdAt);
            const updatedAt = new Date(user.updatedAt);

            expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
            expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
            expect(updatedAt.getTime()).toEqual(createdAt.getTime());
        });
    });

    describe('getUserById', () => {
        it('should retrieve a user by ID', async () => {
            const created = await createUser(db, {
                name: 'Test User',
                email: 'test@example.com',
                age: 30,
            });

            const retrieved = await getUserById(db, created.id);

            expect(retrieved).not.toBeNull();
            expect(retrieved?.id).toBe(created.id);
            expect(retrieved?.name).toBe('Test User');
            expect(retrieved?.email).toBe('test@example.com');
            expect(retrieved?.age).toBe(30);
        });

        it('should return null for non-existent user', async () => {
            const result = await getUserById(db, 'non-existent-id');
            expect(result).toBeNull();
        });
    });

    describe('listUsers', () => {
        beforeEach(async () => {
            // Create test data
            await createUser(db, { name: 'Alice Smith', email: 'alice@example.com', age: 25 });
            await createUser(db, { name: 'Bob Johnson', email: 'bob@example.com', age: 30 });
            await createUser(db, { name: 'Charlie Brown', email: 'charlie@example.com', age: 35 });
        });

        it('should list all users without filters', async () => {
            const result = await listUsers(db, {});

            expect(result.users.length).toBe(3);
            expect(result.total).toBe(3);
        });

        it('should filter users by name', async () => {
            const result = await listUsers(db, { name: 'Alice' });

            expect(result.users.length).toBe(1);
            expect(result.users[0].name).toBe('Alice Smith');
            expect(result.total).toBe(1);
        });

        it('should filter users by email', async () => {
            const result = await listUsers(db, { email: 'bob' });

            expect(result.users.length).toBe(1);
            expect(result.users[0].email).toBe('bob@example.com');
        });

        it('should filter users by minimum age', async () => {
            const result = await listUsers(db, { minAge: 30 });

            expect(result.users.length).toBe(2); // Bob (30) and Charlie (35)
            expect(result.total).toBe(2);
        });

        it('should filter users by maximum age', async () => {
            const result = await listUsers(db, { maxAge: 30 });

            expect(result.users.length).toBe(2); // Alice (25) and Bob (30)
            expect(result.total).toBe(2);
        });

        it('should filter by age range', async () => {
            const result = await listUsers(db, { minAge: 25, maxAge: 30 });

            expect(result.users.length).toBe(2); // Alice (25) and Bob (30)
        });

        it('should support pagination with limit', async () => {
            const result = await listUsers(db, { limit: 2, offset: 0 });

            expect(result.users.length).toBe(2);
            expect(result.total).toBe(3);
        });

        it('should support pagination with offset', async () => {
            const result1 = await listUsers(db, { limit: 2, offset: 0 });
            const result2 = await listUsers(db, { limit: 2, offset: 2 });

            expect(result1.users[0].id).not.toBe(result2.users[0].id);
        });

        it('should combine multiple filters', async () => {
            const result = await listUsers(db, {
                name: 'Smith',
                minAge: 20,
                maxAge: 30,
            });

            expect(result.users.length).toBe(1);
            expect(result.users[0].name).toBe('Alice Smith');
        });

        it('should return empty list for no matches', async () => {
            const result = await listUsers(db, { name: 'NonExistent' });

            expect(result.users.length).toBe(0);
            expect(result.total).toBe(0);
        });
    });

    describe('updateUser', () => {
        it('should update user name', async () => {
            const created = await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            const updated = await updateUser(db, created.id, { name: 'Jane' });

            expect(updated).not.toBeNull();
            expect(updated?.name).toBe('Jane');
            expect(updated?.email).toBe('john@example.com');
            expect(updated?.age).toBe(30);
        });

        it('should update user age', async () => {
            const created = await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            const updated = await updateUser(db, created.id, { age: 31 });

            expect(updated?.age).toBe(31);
        });

        it('should update user email', async () => {
            const created = await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            const updated = await updateUser(db, created.id, {
                email: 'john.doe@example.com',
            });

            expect(updated?.email).toBe('john.doe@example.com');
        });

        it('should update multiple fields at once', async () => {
            const created = await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            const updated = await updateUser(db, created.id, {
                name: 'Jane',
                age: 31,
            });

            expect(updated?.name).toBe('Jane');
            expect(updated?.age).toBe(31);
            expect(updated?.email).toBe('john@example.com');
        });

        it('should update updatedAt timestamp', async () => {
            const created = await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            const createdTime = new Date(created.updatedAt);

            // Wait a bit to ensure timestamp difference
            await new Promise((resolve) => setTimeout(resolve, 10));

            const updated = await updateUser(db, created.id, { age: 31 });

            const updatedTime = new Date(updated!.updatedAt);

            expect(updatedTime.getTime()).toBeGreaterThanOrEqual(
                createdTime.getTime()
            );
        });

        it('should return null for non-existent user', async () => {
            const result = await updateUser(db, 'non-existent-id', {
                name: 'Jane',
            });

            expect(result).toBeNull();
        });

        it('should return user if no updates provided', async () => {
            const created = await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            const result = await updateUser(db, created.id, {});

            expect(result?.id).toBe(created.id);
        });

        it('should reject duplicate email during update', async () => {
            await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            const user2 = await createUser(db, {
                name: 'Jane',
                email: 'jane@example.com',
                age: 28,
            });

            await expect(
                updateUser(db, user2.id, { email: 'john@example.com' })
            ).rejects.toThrow();
        });
    });

    describe('deleteUser', () => {
        it('should delete an existing user', async () => {
            const created = await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            const deleted = await deleteUser(db, created.id);

            expect(deleted).toBe(true);

            const retrieved = await getUserById(db, created.id);
            expect(retrieved).toBeNull();
        });

        it('should return false for non-existent user', async () => {
            const deleted = await deleteUser(db, 'non-existent-id');

            expect(deleted).toBe(false);
        });

        it('should delete multiple users independently', async () => {
            const user1 = await createUser(db, {
                name: 'John',
                email: 'john@example.com',
                age: 30,
            });

            const user2 = await createUser(db, {
                name: 'Jane',
                email: 'jane@example.com',
                age: 28,
            });

            await deleteUser(db, user1.id);

            const retrieved1 = await getUserById(db, user1.id);
            const retrieved2 = await getUserById(db, user2.id);

            expect(retrieved1).toBeNull();
            expect(retrieved2).not.toBeNull();
        });
    });
});
