/**
 * SQLite Database Setup and Management
 */

import sqlite3 from 'sqlite3';

const DATABASE_FILE = 'scoreboard.db';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface ScoreHistory {
  id: string;
  userId: string;
  actionType: string;
  scoreIncrease: number;
  timestamp: string;
}

export interface ActionConfig {
  actionType: string;
  scoreValue: number;
}

// Initialize database
export function initializeDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DATABASE_FILE, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        createTables(db)
          .then(() => resolve(db))
          .catch(reject);
      }
    });
  });
}

// Create all required tables
function createTables(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    // Users table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        createdAt TEXT NOT NULL
      )`,
      (err) => {
        if (err) return reject(err);

        // Score history table
        db.run(
          `CREATE TABLE IF NOT EXISTS score_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            action_type TEXT NOT NULL,
            score_increase INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
          )`,
          (err) => {
            if (err) return reject(err);

            // Actions configuration table
            db.run(
              `CREATE TABLE IF NOT EXISTS actions (
                id TEXT PRIMARY KEY,
                action_type TEXT NOT NULL UNIQUE,
                score_value INTEGER NOT NULL,
                created_at TEXT NOT NULL
              )`,
              (err) => {
                if (err) return reject(err);

                // Idempotency tracking
                db.run(
                  `CREATE TABLE IF NOT EXISTS idempotency (
                    action_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                  )`,
                  (err) => {
                    if (err) return reject(err);

                    // Create indexes
                    createIndexes(db).then(() => resolve()).catch(reject);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

function createIndexes(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_score_history_user ON score_history(user_id)`,
      (err) => {
        if (err) return reject(err);

        db.run(
          `CREATE INDEX IF NOT EXISTS idx_score_history_timestamp ON score_history(timestamp DESC)`,
          (err) => {
            if (err) return reject(err);

            db.run(
              `CREATE INDEX IF NOT EXISTS idx_idempotency_user ON idempotency(user_id)`,
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          }
        );
      }
    );
  });
}

// Create a user
export function createUser(db: sqlite3.Database, user: User): Promise<User> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (id, username, email, createdAt)
       VALUES (?, ?, ?, ?)`,
      [user.id, user.username, user.email, user.createdAt],
      (err) => {
        if (err) reject(err);
        else resolve(user);
      }
    );
  });
}

// Get user by ID
export function getUserById(db: sqlite3.Database, id: string): Promise<User | null> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE id = ?',
      [id],
      (err, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
}

// Add score history entry
export function addScoreHistory(
  db: sqlite3.Database,
  scoreHistory: ScoreHistory
): Promise<ScoreHistory> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO score_history (id, user_id, action_type, score_increase, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [
        scoreHistory.id,
        scoreHistory.userId,
        scoreHistory.actionType,
        scoreHistory.scoreIncrease,
        scoreHistory.timestamp,
      ],
      (err) => {
        if (err) reject(err);
        else resolve(scoreHistory);
      }
    );
  });
}

// Get total score for a user
export function getTotalScore(db: sqlite3.Database, userId: string): Promise<number> {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COALESCE(SUM(score_increase), 0) as total_score
       FROM score_history
       WHERE user_id = ?`,
      [userId],
      (err, row: any) => {
        if (err) reject(err);
        else resolve(row.total_score || 0);
      }
    );
  });
}

// Get all users with their total scores
export function getAllUsersWithScores(
  db: sqlite3.Database
): Promise<Array<{ id: string; username: string; totalScore: number; lastUpdated: string }>> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
        u.id,
        u.username,
        COALESCE(SUM(sh.score_increase), 0) as totalScore,
        MAX(sh.timestamp) as lastUpdated
       FROM users u
       LEFT JOIN score_history sh ON u.id = sh.user_id
       GROUP BY u.id, u.username
       ORDER BY totalScore DESC`,
      (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

// Record action for idempotency
export function recordAction(
  db: sqlite3.Database,
  actionId: string,
  userId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO idempotency (action_id, user_id, timestamp)
       VALUES (?, ?, ?)`,
      [actionId, userId, new Date().toISOString()],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Check if action already processed
export function isActionProcessed(db: sqlite3.Database, actionId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT action_id FROM idempotency WHERE action_id = ?',
      [actionId],
      (err, row: any) => {
        if (err) reject(err);
        else resolve(!!row);
      }
    );
  });
}

// Setup default actions
export function setupDefaultActions(db: sqlite3.Database): Promise<void> {
  const defaultActions = [
    { type: 'button_click', value: 10 },
    { type: 'quest_complete', value: 50 },
    { type: 'level_up', value: 100 },
    { type: 'achievement', value: 25 },
    { type: 'milestone', value: 200 },
    { type: 'daily_challenge', value: 75 },
  ];

  return new Promise((resolve, reject) => {
    let completed = 0;

    defaultActions.forEach((action) => {
      db.run(
        `INSERT OR IGNORE INTO actions (id, action_type, score_value, created_at)
         VALUES (?, ?, ?, ?)`,
        [action.type, action.type, action.value, new Date().toISOString()],
        (err) => {
          if (err) return reject(err);
          completed++;
          if (completed === defaultActions.length) resolve();
        }
      );
    });

    if (defaultActions.length === 0) resolve();
  });
}

// Get action score value
export function getActionScoreValue(db: sqlite3.Database, actionType: string): Promise<number> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT score_value FROM actions WHERE action_type = ?',
      [actionType],
      (err, row: any) => {
        if (err) reject(err);
        else resolve(row?.score_value || null);
      }
    );
  });
}
