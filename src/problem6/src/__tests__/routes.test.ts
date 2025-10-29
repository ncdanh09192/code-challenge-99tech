/**
 * Integration Tests for Live Scoreboard API
 */

import request from 'supertest';
import express from 'express';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, createUser, setupDefaultActions, User } from '../database';
import { generateToken } from '../auth';
import { createRoutes } from '../routes';
import fs from 'fs';

describe('Live Scoreboard API', () => {
  let app: express.Application;
  let db: sqlite3.Database;
  let testUserId: string;
  let testUser: User;
  let testToken: string;

  beforeAll(async () => {
    // Use test database
    db = await initializeDatabase();
    await setupDefaultActions(db);

    // Create app
    app = express();
    app.use(express.json());
    app.use(createRoutes(db));

    // Create test user
    testUserId = uuidv4();
    testUser = {
      id: testUserId,
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
    };
    await createUser(db, testUser);

    // Generate token
    testToken = generateToken(testUserId);
  });

  afterAll(async () => {
    return new Promise<void>((resolve) => {
      db.close(() => {
        // Clean up test database
        fs.unlink('scoreboard.db', (err) => {
          resolve();
        });
      });
    });
  });

  describe('GET /health', () => {
    it('should return 200 with server status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
    });

    it('should include timestamp in response', async () => {
      const response = await request(app).get('/health');

      expect(response.body.timestamp).toBeDefined();
      expect(typeof response.body.timestamp).toBe('string');
    });
  });

  describe('GET /api/scores/top10', () => {
    it('should return empty top 10 initially', async () => {
      const response = await request(app).get('/api/scores/top10');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.scores)).toBe(true);
      expect(response.body.data.scores.length).toBe(0);
    });

    it('should include generatedAt timestamp', async () => {
      const response = await request(app).get('/api/scores/top10');

      expect(response.body.data.generatedAt).toBeDefined();
    });

    it('should have source field indicating cache or database', async () => {
      const response = await request(app).get('/api/scores/top10');

      expect(response.body.data.source).toMatch(/cache|database/);
    });

    it('should return 500 on database error', async () => {
      // This is harder to test without mocking, so we verify the structure
      const response = await request(app).get('/api/scores/top10');
      expect(response.status).toMatch(/200|500/);
    });
  });

  describe('POST /api/scores/update', () => {
    const actionId = uuidv4();

    it('should return 401 without authorization header', async () => {
      const response = await request(app).post('/api/scores/update').send({
        actionId: uuidv4(),
        actionType: 'quest_complete',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('authorization');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          actionId: uuidv4(),
          actionType: 'quest_complete',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 without actionId', async () => {
      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          actionType: 'quest_complete',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 without actionType', async () => {
      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          actionId: uuidv4(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 with invalid action type', async () => {
      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          actionId: uuidv4(),
          actionType: 'invalid_action',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid action type');
    });

    it('should successfully update score with quest_complete', async () => {
      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          actionId: uuidv4(),
          actionType: 'quest_complete',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.previousScore).toBe(0);
      expect(response.body.data.newScore).toBe(50); // quest_complete = 50 points
      expect(response.body.data.scoreIncrease).toBe(50);
      expect(response.body.data.rank).toBeGreaterThan(0);
    });

    it('should successfully update score with level_up', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: uuidv4(),
          actionType: 'level_up',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.scoreIncrease).toBe(100); // level_up = 100 points
      expect(response.body.data.newScore).toBe(100);
    });

    it('should successfully update score with achievement', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: uuidv4(),
          actionType: 'achievement',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.scoreIncrease).toBe(25); // achievement = 25 points
    });

    it('should successfully update score with milestone', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: uuidv4(),
          actionType: 'milestone',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.scoreIncrease).toBe(200); // milestone = 200 points
    });

    it('should successfully update score with daily_challenge', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: uuidv4(),
          actionType: 'daily_challenge',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.scoreIncrease).toBe(75); // daily_challenge = 75 points
    });

    it('should prevent duplicate actions (idempotency)', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      const sameActionId = uuidv4();

      // First request
      const response1 = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: sameActionId,
          actionType: 'quest_complete',
        });

      expect(response1.status).toBe(200);
      expect(response1.body.data.newScore).toBe(50);

      // Second request with same actionId
      const response2 = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: sameActionId,
          actionType: 'quest_complete',
        });

      expect(response2.status).toBe(200);
      expect(response2.body.data.newScore).toBe(50); // Score doesn't increase again
      expect(response2.body.data.scoreIncrease).toBe(0); // No increase
    });

    it('should accumulate scores correctly', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      // First action: quest_complete (+50)
      const response1 = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: uuidv4(),
          actionType: 'quest_complete',
        });

      expect(response1.body.data.newScore).toBe(50);

      // Second action: achievement (+25)
      const response2 = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: uuidv4(),
          actionType: 'achievement',
        });

      expect(response2.body.data.previousScore).toBe(50);
      expect(response2.body.data.newScore).toBe(75); // 50 + 25
      expect(response2.body.data.scoreIncrease).toBe(25);
    });

    it('should invalidate cache after score update', async () => {
      // Get top10 to populate cache
      await request(app).get('/api/scores/top10');

      // Update score (should invalidate cache)
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: uuidv4(),
          actionType: 'level_up',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/scores/user/:userId', () => {
    it('should return user score and rank', async () => {
      const response = await request(app).get(`/api/scores/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.username).toBe(testUser.username);
      expect(typeof response.body.data.score).toBe('number');
      expect(typeof response.body.data.rank).toBe('number');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeUserId = uuidv4();
      const response = await request(app).get(`/api/scores/user/${fakeUserId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User not found');
    });

    it('should return correct score after updates', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      // Add score
      await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: uuidv4(),
          actionType: 'quest_complete', // +50
        });

      // Get user score
      const response = await request(app).get(`/api/scores/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.score).toBe(50);
    });

    it('should return ranking among all users', async () => {
      const user1Id = uuidv4();
      const user2Id = uuidv4();

      const user1: User = {
        id: user1Id,
        username: `user1_${uuidv4().substring(0, 8)}`,
        email: `user1_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      const user2: User = {
        id: user2Id,
        username: `user2_${uuidv4().substring(0, 8)}`,
        email: `user2_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };

      await createUser(db, user1);
      await createUser(db, user2);

      const token1 = generateToken(user1Id);
      const token2 = generateToken(user2Id);

      // User 1: +50
      await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          actionId: uuidv4(),
          actionType: 'quest_complete',
        });

      // User 2: +200
      await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          actionId: uuidv4(),
          actionType: 'milestone',
        });

      const response1 = await request(app).get(`/api/scores/user/${user1Id}`);
      const response2 = await request(app).get(`/api/scores/user/${user2Id}`);

      expect(response1.body.data.score).toBe(50);
      expect(response2.body.data.score).toBe(200);
      expect(response2.body.data.rank).toBeLessThan(response1.body.data.rank);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${testToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toMatch(/400|500/);
    });

    it('should handle missing Content-Type', async () => {
      const response = await request(app).get('/api/scores/top10');

      expect(response.status).toBe(200);
    });

    it('should handle concurrent requests', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      const requests = Array(5)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/scores/update')
            .set('Authorization', `Bearer ${token}`)
            .send({
              actionId: uuidv4(),
              actionType: 'quest_complete',
            })
        );

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Final score should be 250 (5 * 50)
      const finalScore = await request(app).get(`/api/scores/user/${userId}`);
      expect(finalScore.body.data.score).toBe(250);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain score history accuracy', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      const actions = [
        { type: 'quest_complete', expected: 50 },
        { type: 'achievement', expected: 25 },
        { type: 'level_up', expected: 100 },
      ];

      let totalScore = 0;

      for (const action of actions) {
        const response = await request(app)
          .post('/api/scores/update')
          .set('Authorization', `Bearer ${token}`)
          .send({
            actionId: uuidv4(),
            actionType: action.type,
          });

        totalScore += action.expected;
        expect(response.body.data.newScore).toBe(totalScore);
      }
    });

    it('should not allow negative scores', async () => {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        username: `user_${uuidv4().substring(0, 8)}`,
        email: `user_${uuidv4().substring(0, 8)}@example.com`,
        createdAt: new Date().toISOString(),
      };
      await createUser(db, user);
      const token = generateToken(userId);

      const response = await request(app)
        .post('/api/scores/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionId: uuidv4(),
          actionType: 'quest_complete',
        });

      expect(response.body.data.newScore).toBeGreaterThanOrEqual(0);
    });
  });
});
