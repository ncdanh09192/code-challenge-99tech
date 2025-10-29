/**
 * Redis Cache Service
 * Manages caching of top 10 scores and user scores
 */

import { createClient, RedisClientType } from 'redis';

export interface CachedScore {
  rank: number;
  userId: string;
  username: string;
  score: number;
  lastUpdated: string;
}

export class CacheService {
  private client: RedisClientType | null = null;
  private readonly TOP10_KEY = 'leaderboard:top10';
  private readonly USER_SCORE_KEY = 'user:score:';
  private readonly TTL = 300; // 5 minutes

  async connect(): Promise<void> {
    try {
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

      this.client = createClient({
        socket: {
          host: redisHost,
          port: redisPort,
        },
      });

      this.client.on('error', (err: any) => {
        console.error('Redis Client Error', err);
      });

      await this.client.connect();
      console.log(`✓ Connected to Redis at ${redisHost}:${redisPort}`);
    } catch (err) {
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      console.log('Disconnected from Redis');
    }
  }

  /**
   * Cache top 10 scores as sorted set
   */
  async cacheTop10(scores: Array<{ userId: string; username: string; score: number }>): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');

    try {
      // Clear existing cache
      await this.client.del(this.TOP10_KEY);

      if (scores.length === 0) return;

      // Add top 10 to sorted set
      const members: { score: number; value: string }[] = scores.slice(0, 10).map((s, i) => ({
        score: 10 - i,
        value: JSON.stringify(s),
      }));

      if (members.length > 0) {
        await this.client.zAdd(this.TOP10_KEY, members);
        await this.client.expire(this.TOP10_KEY, this.TTL);
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get cached top 10 scores
   */
  async getTop10(): Promise<CachedScore[] | null> {
    if (!this.client) throw new Error('Redis not connected');

    try {
      const replies = await this.client.zRange(this.TOP10_KEY, 0, -1, { REV: true });
      if (!replies || replies.length === 0) return null;

      const scores: CachedScore[] = replies.map((reply: any, index: number) => ({
        ...JSON.parse(reply),
        rank: index + 1,
      }));
      return scores;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Invalidate top 10 cache
   */
  async invalidateTop10(): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');

    try {
      await this.client.del(this.TOP10_KEY);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Cache user's score
   */
  async cacheUserScore(userId: string, score: number): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');

    try {
      const key = `${this.USER_SCORE_KEY}${userId}`;
      await this.client.setEx(key, this.TTL, score.toString());
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get cached user score
   */
  async getCachedUserScore(userId: string): Promise<number | null> {
    if (!this.client) throw new Error('Redis not connected');

    try {
      const key = `${this.USER_SCORE_KEY}${userId}`;
      const reply = await this.client.get(key);
      if (!reply) return null;
      return parseInt(reply, 10);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Clear user score cache
   */
  async clearUserScore(userId: string): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');

    try {
      const key = `${this.USER_SCORE_KEY}${userId}`;
      await this.client.del(key);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Check cache health
   */
  async ping(): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');

    try {
      const reply = await this.client.ping();
      return reply === 'PONG';
    } catch (err) {
      throw err;
    }
  }
}

export const cacheService = new CacheService();
