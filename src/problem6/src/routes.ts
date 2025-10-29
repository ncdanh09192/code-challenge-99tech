/**
 * API Routes
 */

import { Router, Response } from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { LeaderboardService } from './leaderboard';
import { AuthRequest, authMiddleware, generateToken } from './auth';
import { getUserById } from './database';

export function createRoutes(db: sqlite3.Database): Router {
  const router = Router();
  const leaderboardService = new LeaderboardService(db);

  /**
   * GET /health
   * Health check
   */
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * POST /auth/register
   * Register or authenticate a user (returns JWT token)
   */
  router.post('/auth/register', async (req, res) => {
    try {
      const { username } = req.body;

      // Validation
      if (!username || typeof username !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Username is required',
        });
      }

      // Check if user exists
      let user: any = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
          if (err) reject(err);
          resolve(row as any);
        });
      });

      // If user doesn't exist, create one
      if (!user) {
        const userId = uuidv4();
        const now = new Date().toISOString();
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO users (id, username, email, createdAt) VALUES (?, ?, ?, ?)',
            [userId, username, `${username}@scoreboard.local`, now],
            function (err) {
              if (err) reject(err);
              resolve(userId);
            }
          );
        });
        user = { id: userId, username, score: 0 };
      }

      // Generate JWT token
      const token = generateToken((user as any).id);

      res.json({
        success: true,
        userId: (user as any).id,
        username: (user as any).username,
        token: token,
        message: 'Authenticated successfully',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        details: err.message,
      });
    }
  });

  /**
   * GET /api/scores/top10
   * Get top 10 scores with caching
   */
  router.get('/api/scores/top10', async (req, res) => {
    try {
      const result = await leaderboardService.getTop10();

      res.json({
        success: true,
        data: {
          scores: result.scores,
          generatedAt: new Date().toISOString(),
          source: result.cachedAt ? 'cache' : 'database',
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch top 10 scores',
        details: err.message,
      });
    }
  });

  /**
   * POST /api/scores/update
   * Update user score (requires authentication)
   */
  router.post('/api/scores/update', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { actionId, actionType } = req.body;
      const userId = req.userId;

      // Validation
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      if (!actionId || !actionType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: actionId, actionType',
        });
      }

      if (typeof actionId !== 'string' || typeof actionType !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid field types',
        });
      }

      // Verify user exists
      const user = await getUserById(db, userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Update score
      const result = await leaderboardService.updateScore(userId, actionId, actionType);

      res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes('Invalid action type')) {
        return res.status(400).json({
          success: false,
          error: err.message,
          code: 'INVALID_ACTION_TYPE',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update score',
        details: err.message,
      });
    }
  });

  /**
   * GET /api/scores/user/:userId
   * Get specific user's score and rank
   */
  router.get('/api/scores/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await getUserById(db, userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const { score, rank } = await leaderboardService.getUserScoreAndRank(userId);

      res.json({
        success: true,
        data: {
          userId,
          username: user.username,
          score,
          rank,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get user score',
        details: err.message,
      });
    }
  });

  return router;
}
