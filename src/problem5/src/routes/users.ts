/**
 * User routes - CRUD endpoints
 */

import { Router, Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import {
    createUser,
    getUserById,
    listUsers,
    updateUser,
    deleteUser,
} from '../database';
import { CreateUserRequest, UpdateUserRequest, ListUsersQuery } from '../types/user';

export function createUserRoutes(db: sqlite3.Database): Router {
    const router = Router();

    /**
     * CREATE - POST /users
     * Create a new user
     */
    router.post('/', async (req: Request, res: Response) => {
        try {
            const { name, email, age } = req.body;

            // Validation
            if (!name || !email || age === undefined) {
                return res.status(400).json({
                    error: 'Missing required fields: name, email, age',
                });
            }

            if (typeof age !== 'number' || age < 0) {
                return res.status(400).json({
                    error: 'Age must be a non-negative number',
                });
            }

            if (!email.includes('@')) {
                return res.status(400).json({
                    error: 'Invalid email format',
                });
            }

            const userData: CreateUserRequest = { name, email, age };
            const user = await createUser(db, userData);

            res.status(201).json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            if (error.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                    error: 'Email already exists',
                });
            }
            res.status(500).json({
                error: 'Failed to create user',
                details: error.message,
            });
        }
    });

    /**
     * READ - GET /users/:id
     * Get a specific user by ID
     */
    router.get('/:id', async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = await getUserById(db, id);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                });
            }

            res.json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            res.status(500).json({
                error: 'Failed to get user',
                details: error.message,
            });
        }
    });

    /**
     * LIST - GET /users
     * List all users with optional filters
     *
     * Query parameters:
     * - name: filter by name (partial match)
     * - email: filter by email (partial match)
     * - minAge: filter by minimum age
     * - maxAge: filter by maximum age
     * - limit: number of results per page (default 10, max 100)
     * - offset: number of results to skip (default 0)
     */
    router.get('/', async (req: Request, res: Response) => {
        try {
            const query: ListUsersQuery = {
                name: req.query.name as string | undefined,
                email: req.query.email as string | undefined,
                minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
                maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
                offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
            };

            // Validate numeric filters
            if (query.minAge !== undefined && isNaN(query.minAge)) {
                return res.status(400).json({
                    error: 'Invalid minAge parameter',
                });
            }
            if (query.maxAge !== undefined && isNaN(query.maxAge)) {
                return res.status(400).json({
                    error: 'Invalid maxAge parameter',
                });
            }
            if (isNaN(query.limit!)) {
                return res.status(400).json({
                    error: 'Invalid limit parameter',
                });
            }
            if (isNaN(query.offset!)) {
                return res.status(400).json({
                    error: 'Invalid offset parameter',
                });
            }

            const result = await listUsers(db, query);

            res.json({
                success: true,
                data: result.users,
                pagination: {
                    total: result.total,
                    limit: query.limit,
                    offset: query.offset,
                    hasMore: (query.offset! + query.limit!) < result.total,
                },
            });
        } catch (error: any) {
            res.status(500).json({
                error: 'Failed to list users',
                details: error.message,
            });
        }
    });

    /**
     * UPDATE - PUT /users/:id
     * Update a specific user
     */
    router.put('/:id', async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, email, age } = req.body;

            // Validate at least one field is provided
            if (name === undefined && email === undefined && age === undefined) {
                return res.status(400).json({
                    error: 'At least one field to update is required (name, email, or age)',
                });
            }

            // Validate types
            if (age !== undefined && (typeof age !== 'number' || age < 0)) {
                return res.status(400).json({
                    error: 'Age must be a non-negative number',
                });
            }

            if (email !== undefined && !email.includes('@')) {
                return res.status(400).json({
                    error: 'Invalid email format',
                });
            }

            const updates: UpdateUserRequest = {};
            if (name !== undefined) updates.name = name;
            if (email !== undefined) updates.email = email;
            if (age !== undefined) updates.age = age;

            const updatedUser = await updateUser(db, id, updates);

            if (!updatedUser) {
                return res.status(404).json({
                    error: 'User not found',
                });
            }

            res.json({
                success: true,
                data: updatedUser,
            });
        } catch (error: any) {
            if (error.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                    error: 'Email already exists',
                });
            }
            res.status(500).json({
                error: 'Failed to update user',
                details: error.message,
            });
        }
    });

    /**
     * DELETE - DELETE /users/:id
     * Delete a specific user
     */
    router.delete('/:id', async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deleted = await deleteUser(db, id);

            if (!deleted) {
                return res.status(404).json({
                    error: 'User not found',
                });
            }

            res.json({
                success: true,
                message: 'User deleted successfully',
            });
        } catch (error: any) {
            res.status(500).json({
                error: 'Failed to delete user',
                details: error.message,
            });
        }
    });

    return router;
}
