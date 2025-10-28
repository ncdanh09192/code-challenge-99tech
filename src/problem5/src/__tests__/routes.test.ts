/**
 * Integration tests for API endpoints
 */

import request from 'supertest';
import sqlite3 from 'sqlite3';
import { createApp } from '../app';

let db: sqlite3.Database;
let app: any;

// Setup and teardown
beforeAll(async () => {
    db = await new Promise((resolve, reject) => {
        const testDb = new sqlite3.Database(':memory:', (err) => {
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

    app = createApp(db);
});

afterAll((done) => {
    db.close(done);
});

// Clear table before each test
beforeEach((done) => {
    db.run('DELETE FROM users', done);
});

describe('API Routes', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body.timestamp).toBeDefined();
        });
    });

    describe('POST /api/users', () => {
        it('should create a user with valid data', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 30,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.name).toBe('John Doe');
            expect(response.body.data.email).toBe('john@example.com');
            expect(response.body.data.age).toBe(30);
            expect(response.body.data.createdAt).toBeDefined();
            expect(response.body.data.updatedAt).toBeDefined();
        });

        it('should return 400 for missing name', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    email: 'john@example.com',
                    age: 30,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    age: 30,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it('should return 400 for missing age', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'invalid-email',
                    age: 30,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('email');
        });

        it('should return 400 for negative age', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: -5,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Age');
        });

        it('should return 400 for non-numeric age', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 'thirty',
                });

            expect(response.status).toBe(400);
        });

        it('should return 409 for duplicate email', async () => {
            await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 30,
                });

            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'Jane Doe',
                    email: 'john@example.com',
                    age: 28,
                });

            expect(response.status).toBe(409);
            expect(response.body.error).toContain('Email already exists');
        });
    });

    describe('GET /api/users/:id', () => {
        it('should retrieve an existing user', async () => {
            const createResponse = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 30,
                });

            const userId = createResponse.body.data.id;

            const getResponse = await request(app).get(`/api/users/${userId}`);

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.success).toBe(true);
            expect(getResponse.body.data.id).toBe(userId);
            expect(getResponse.body.data.name).toBe('John Doe');
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app).get(
                '/api/users/non-existent-id'
            );

            expect(response.status).toBe(404);
            expect(response.body.error).toContain('User not found');
        });
    });

    describe('GET /api/users', () => {
        beforeEach(async () => {
            // Create test data
            await request(app)
                .post('/api/users')
                .send({
                    name: 'Alice Smith',
                    email: 'alice@example.com',
                    age: 25,
                });

            await request(app)
                .post('/api/users')
                .send({
                    name: 'Bob Johnson',
                    email: 'bob@example.com',
                    age: 30,
                });

            await request(app)
                .post('/api/users')
                .send({
                    name: 'Charlie Brown',
                    email: 'charlie@example.com',
                    age: 35,
                });
        });

        it('should list all users', async () => {
            const response = await request(app).get('/api/users');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(3);
            expect(response.body.pagination.total).toBe(3);
        });

        it('should filter by name', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ name: 'Alice' });

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].name).toBe('Alice Smith');
        });

        it('should filter by email', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ email: 'bob' });

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].email).toBe('bob@example.com');
        });

        it('should filter by minAge', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ minAge: 30 });

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(2);
        });

        it('should filter by maxAge', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ maxAge: 30 });

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(2);
        });

        it('should filter by age range', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ minAge: 25, maxAge: 30 });

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(2);
        });

        it('should support limit parameter', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ limit: 2 });

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(2);
            expect(response.body.pagination.limit).toBe(2);
        });

        it('should support offset parameter', async () => {
            const response1 = await request(app)
                .get('/api/users')
                .query({ limit: 2, offset: 0 });

            const response2 = await request(app)
                .get('/api/users')
                .query({ limit: 2, offset: 2 });

            expect(response1.body.data[0].id).not.toBe(
                response2.body.data[0].id
            );
        });

        it('should indicate hasMore in pagination', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ limit: 2 });

            expect(response.body.pagination.hasMore).toBe(true);
        });

        it('should return 400 for invalid minAge', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ minAge: 'invalid' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid maxAge', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ maxAge: 'invalid' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid limit', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ limit: 'invalid' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid offset', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({ offset: 'invalid' });

            expect(response.status).toBe(400);
        });

        it('should combine multiple filters', async () => {
            const response = await request(app)
                .get('/api/users')
                .query({
                    name: 'Smith',
                    minAge: 20,
                    maxAge: 30,
                });

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].name).toBe('Alice Smith');
        });
    });

    describe('PUT /api/users/:id', () => {
        let userId: string;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 30,
                });

            userId = createResponse.body.data.id;
        });

        it('should update user name', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ name: 'Jane Doe' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Jane Doe');
            expect(response.body.data.email).toBe('john@example.com');
        });

        it('should update user age', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ age: 31 });

            expect(response.status).toBe(200);
            expect(response.body.data.age).toBe(31);
        });

        it('should update user email', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ email: 'jane@example.com' });

            expect(response.status).toBe(200);
            expect(response.body.data.email).toBe('jane@example.com');
        });

        it('should update multiple fields', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    name: 'Jane Doe',
                    age: 31,
                });

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe('Jane Doe');
            expect(response.body.data.age).toBe(31);
        });

        it('should return 400 for no fields to update', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({});

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid age', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ age: -5 });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ email: 'invalid-email' });

            expect(response.status).toBe(400);
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .put('/api/users/non-existent-id')
                .send({ name: 'Jane' });

            expect(response.status).toBe(404);
        });

        it('should return 409 for duplicate email', async () => {
            // Create another user
            await request(app)
                .post('/api/users')
                .send({
                    name: 'Other User',
                    email: 'other@example.com',
                    age: 25,
                });

            // Try to update first user with existing email
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ email: 'other@example.com' });

            expect(response.status).toBe(409);
        });

        it('should update updatedAt timestamp', async () => {
            const getResponse1 = await request(app).get(`/api/users/${userId}`);
            const originalUpdatedAt = getResponse1.body.data.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 10));

            const updateResponse = await request(app)
                .put(`/api/users/${userId}`)
                .send({ age: 31 });

            expect(updateResponse.body.data.updatedAt).not.toBe(
                originalUpdatedAt
            );
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete an existing user', async () => {
            const createResponse = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 30,
                });

            const userId = createResponse.body.data.id;

            const deleteResponse = await request(app).delete(
                `/api/users/${userId}`
            );

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body.success).toBe(true);
            expect(deleteResponse.body.message).toContain('deleted');

            // Verify user is deleted
            const getResponse = await request(app).get(`/api/users/${userId}`);
            expect(getResponse.status).toBe(404);
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app).delete(
                '/api/users/non-existent-id'
            );

            expect(response.status).toBe(404);
            expect(response.body.error).toContain('User not found');
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for non-existent route', async () => {
            const response = await request(app).get('/api/nonexistent');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Not Found');
        });
    });
});
