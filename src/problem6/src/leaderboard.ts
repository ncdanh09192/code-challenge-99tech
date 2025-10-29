/**
 * Leaderboard Service
 * Handles score calculation and top 10 retrieval
 */

import sqlite3 from 'sqlite3';
import { cacheService } from './cache';
import { v4 as uuidv4 } from 'uuid';
import {
  getTotalScore,
  getAllUsersWithScores,
  addScoreHistory,
  getActionScoreValue,
  isActionProcessed,
  recordAction,
} from './database';

export interface ScoreUpdateResult {
  userId: string;
  previousScore: number;
  newScore: number;
  scoreIncrease: number;
  rank: number;
  timestamp: string;
}

export interface Top10Entry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  lastUpdated: string;
}

export class LeaderboardService {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  /**
   * Get top 10 scores (with caching)
   */
  async getTop10(): Promise<{ scores: Top10Entry[]; cachedAt?: string }> {
    try {
      // Try cache first
      const cached = await cacheService.getTop10();
      if (cached && cached.length > 0) {
        return {
          scores: cached.map((c) => ({
            rank: c.rank,
            userId: c.userId,
            username: c.username,
            score: c.score,
            lastUpdated: c.lastUpdated,
          })),
          cachedAt: new Date().toISOString(),
        };
      }

      // Cache miss - calculate from database
      const allUsersWithScores = await this.getAllUsersWithScores();

      // Get top 10 and format for caching
      const top10 = allUsersWithScores.slice(0, 10).map(u => ({
        userId: u.id,
        username: u.username,
        score: u.totalScore,
      }));

      // Cache the result
      await cacheService.cacheTop10(top10);

      const scoresWithUpdated = allUsersWithScores.slice(0, 10);
      const scores: Top10Entry[] = scoresWithUpdated.map((u, i) => ({
        rank: i + 1,
        userId: u.id,
        username: u.username,
        score: u.totalScore,
        lastUpdated: u.lastUpdated || new Date().toISOString(),
      }));

      return { scores };
    } catch (err) {
      console.error('Error getting top 10:', err);
      throw err;
    }
  }

  /**
   * Get all users with their scores
   */
  private async getAllUsersWithScores(): Promise<
    Array<{ id: string; username: string; totalScore: number; lastUpdated: string }>
  > {
    return getAllUsersWithScores(this.db);
  }

  /**
   * Update user score with action
   */
  async updateScore(
    userId: string,
    actionId: string,
    actionType: string
  ): Promise<ScoreUpdateResult> {
    // Check idempotency
    const alreadyProcessed = await isActionProcessed(this.db, actionId);
    if (alreadyProcessed) {
      // Return success but don't process again
      const score = await getTotalScore(this.db, userId);
      const rank = await this.getUserRank(userId);

      return {
        userId,
        previousScore: score,
        newScore: score,
        scoreIncrease: 0,
        rank,
        timestamp: new Date().toISOString(),
      };
    }

    // Get score value for action
    const scoreValue = await getActionScoreValue(this.db, actionType);
    if (!scoreValue) {
      throw new Error(`Invalid action type: ${actionType}`);
    }

    // Get current score
    const previousScore = await getTotalScore(this.db, userId);

    // Add to score history
    const historyEntry = {
      id: uuidv4(),
      userId,
      actionType,
      scoreIncrease: scoreValue,
      timestamp: new Date().toISOString(),
    };

    await addScoreHistory(this.db, historyEntry);

    // Record action for idempotency
    await recordAction(this.db, actionId, userId);

    // Get new score
    const newScore = await getTotalScore(this.db, userId);

    // Invalidate top10 cache (in case user entered top 10)
    await cacheService.invalidateTop10();

    // Get user's new rank
    const rank = await this.getUserRank(userId);

    return {
      userId,
      previousScore,
      newScore,
      scoreIncrease: scoreValue,
      rank,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user's current rank
   */
  async getUserRank(userId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) + 1 as rank
         FROM (
           SELECT user_id, SUM(score_increase) as total
           FROM score_history
           GROUP BY user_id
         )
         WHERE total > (
           SELECT COALESCE(SUM(score_increase), 0)
           FROM score_history
           WHERE user_id = ?
         )`,
        [userId],
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row?.rank || 1);
        }
      );
    });
  }

  /**
   * Get user's score and rank
   */
  async getUserScoreAndRank(userId: string): Promise<{ score: number; rank: number }> {
    const score = await getTotalScore(this.db, userId);
    const rank = await this.getUserRank(userId);
    return { score, rank };
  }
}
