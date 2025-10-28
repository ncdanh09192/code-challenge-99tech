/**
 * Database setup and management for SQLite
 */

import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserRequest, UpdateUserRequest, ListUsersQuery } from './types/user';

const DATABASE_FILE = 'users.db';

// Initialize database
export function initializeDatabase(): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DATABASE_FILE, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Connected to SQLite database');
                createTable(db)
                    .then(() => resolve(db))
                    .catch(reject);
            }
        });
    });
}

// Create users table
function createTable(db: sqlite3.Database): Promise<void> {
    return new Promise((resolve, reject) => {
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
                if (err) {
                    reject(err);
                } else {
                    console.log('Users table created/verified');
                    resolve();
                }
            }
        );
    });
}

/**
 * Create a new user
 */
export function createUser(db: sqlite3.Database, userData: CreateUserRequest): Promise<User> {
    return new Promise((resolve, reject) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const user: User = {
            id,
            ...userData,
            createdAt: now,
            updatedAt: now,
        };

        db.run(
            `INSERT INTO users (id, name, email, age, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user.id, user.name, user.email, user.age, user.createdAt, user.updatedAt],
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            }
        );
    });
}

/**
 * Get a user by ID
 */
export function getUserById(db: sqlite3.Database, id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM users WHERE id = ?',
            [id],
            (err, row: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            }
        );
    });
}

/**
 * List all users with filters
 */
export function listUsers(db: sqlite3.Database, query: ListUsersQuery): Promise<{ users: User[]; total: number }> {
    return new Promise((resolve, reject) => {
        let whereClause = '1=1';
        const params: any[] = [];

        // Build WHERE clause based on filters
        if (query.name) {
            whereClause += ' AND name LIKE ?';
            params.push(`%${query.name}%`);
        }

        if (query.email) {
            whereClause += ' AND email LIKE ?';
            params.push(`%${query.email}%`);
        }

        if (query.minAge !== undefined) {
            whereClause += ' AND age >= ?';
            params.push(query.minAge);
        }

        if (query.maxAge !== undefined) {
            whereClause += ' AND age <= ?';
            params.push(query.maxAge);
        }

        // Get total count
        db.get(
            `SELECT COUNT(*) as count FROM users WHERE ${whereClause}`,
            params,
            (err, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                const total = row.count;

                // Get paginated results
                const limit = Math.min(query.limit || 10, 100); // Max 100 per page
                const offset = query.offset || 0;
                const queryParams = [...params, limit, offset];

                db.all(
                    `SELECT * FROM users WHERE ${whereClause}
                     ORDER BY createdAt DESC
                     LIMIT ? OFFSET ?`,
                    queryParams,
                    (err, rows: any[]) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ users: rows || [], total });
                        }
                    }
                );
            }
        );
    });
}

/**
 * Update a user
 */
export function updateUser(
    db: sqlite3.Database,
    id: string,
    updates: UpdateUserRequest
): Promise<User | null> {
    return new Promise((resolve, reject) => {
        // First, get the current user
        getUserById(db, id).then((user) => {
            if (!user) {
                resolve(null);
                return;
            }

            // Build UPDATE query dynamically
            const updateFields: string[] = [];
            const updateParams: any[] = [];

            if (updates.name !== undefined) {
                updateFields.push('name = ?');
                updateParams.push(updates.name);
            }

            if (updates.email !== undefined) {
                updateFields.push('email = ?');
                updateParams.push(updates.email);
            }

            if (updates.age !== undefined) {
                updateFields.push('age = ?');
                updateParams.push(updates.age);
            }

            if (updateFields.length === 0) {
                resolve(user);
                return;
            }

            updateFields.push('updatedAt = ?');
            updateParams.push(new Date().toISOString());
            updateParams.push(id);

            db.run(
                `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
                updateParams,
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Return updated user
                        getUserById(db, id).then(resolve).catch(reject);
                    }
                }
            );
        }).catch(reject);
    });
}

/**
 * Delete a user
 */
export function deleteUser(db: sqlite3.Database, id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
            if (err) {
                reject(err);
            } else {
                // this.changes gives the number of rows affected
                resolve(this.changes > 0);
            }
        });
    });
}
