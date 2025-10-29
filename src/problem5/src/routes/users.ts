/**
 * User routes - CRUD endpoints
 * Uses DTOs for standardized request/response handling
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
import {
    CreateUserDTO,
    UpdateUserDTO,
    ListUsersQueryDTO,
    ApiResponse,
    UserResponseDTO,
} from '../dtos/user.dto';
import {
    validateCreateUserDTO,
    validateUpdateUserDTO,
    validateListUsersQueryDTO,
} from '../utils/validation';

export function createUserRoutes(db: sqlite3.Database): Router {
    const router = Router();

    /**
     * CREATE - POST /users
     * Create a new user
     * Request body: CreateUserDTO
     * Response: UserResponseDTO
     */
    router.post('/', async (req: Request, res: Response) => {
        try {
            // Validate using DTO validation
            const validation = validateCreateUserDTO(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors?.map((e) => `${e.field}: ${e.message}`).join('; '),
                } as ApiResponse<never>);
            }

            const userDTO: CreateUserDTO = req.body;
            const userData: CreateUserRequest = { ...userDTO };
            const user = await createUser(db, userData);

            res.status(201).json({
                success: true,
                data: user,
            } as ApiResponse<UserResponseDTO>);
        } catch (error: any) {
            if (error.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already exists',
                    code: 'EMAIL_DUPLICATE',
                } as ApiResponse<never>);
            }
            res.status(500).json({
                success: false,
                error: 'Failed to create user',
                details: error.message,
            } as ApiResponse<never>);
        }
    });

    /**
     * READ - GET /users/:id
     * Get a specific user by ID
     * Response: UserResponseDTO
     */
    router.get('/:id', async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = await getUserById(db, id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    code: 'USER_NOT_FOUND',
                } as ApiResponse<never>);
            }

            res.json({
                success: true,
                data: user,
            } as ApiResponse<UserResponseDTO>);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: 'Failed to get user',
                details: error.message,
            } as ApiResponse<never>);
        }
    });

    /**
     * LIST - GET /users
     * List all users with optional filters
     * Query parameters: ListUsersQueryDTO
     * Response: UserResponseDTO[]
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
            // Validate query parameters using DTO validation
            const validation = validateListUsersQueryDTO(req.query);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors?.map((e) => `${e.field}: ${e.message}`).join('; '),
                } as ApiResponse<never>);
            }

            const query: ListUsersQuery = {
                name: req.query.name as string | undefined,
                email: req.query.email as string | undefined,
                minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
                maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
                offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
            };

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
            } as any);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: 'Failed to list users',
                details: error.message,
            } as ApiResponse<never>);
        }
    });

    /**
     * UPDATE - PUT /users/:id
     * Update a specific user
     * Request body: UpdateUserDTO
     * Response: UserResponseDTO
     */
    router.put('/:id', async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Validate using DTO validation
            const validation = validateUpdateUserDTO(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors?.map((e) => `${e.field}: ${e.message}`).join('; '),
                } as ApiResponse<never>);
            }

            const updates: UpdateUserRequest = {};
            if (req.body.name !== undefined) updates.name = req.body.name;
            if (req.body.email !== undefined) updates.email = req.body.email;
            if (req.body.age !== undefined) updates.age = req.body.age;

            const updatedUser = await updateUser(db, id, updates);

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    code: 'USER_NOT_FOUND',
                } as ApiResponse<never>);
            }

            res.json({
                success: true,
                data: updatedUser,
            } as ApiResponse<UserResponseDTO>);
        } catch (error: any) {
            if (error.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already exists',
                    code: 'EMAIL_DUPLICATE',
                } as ApiResponse<never>);
            }
            res.status(500).json({
                success: false,
                error: 'Failed to update user',
                details: error.message,
            } as ApiResponse<never>);
        }
    });

    /**
     * DELETE - DELETE /users/:id
     * Delete a specific user
     * Response: Success message
     */
    router.delete('/:id', async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deleted = await deleteUser(db, id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    code: 'USER_NOT_FOUND',
                } as ApiResponse<never>);
            }

            res.json({
                success: true,
                message: 'User deleted successfully',
            } as any);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: 'Failed to delete user',
                details: error.message,
            } as ApiResponse<never>);
        }
    });

    return router;
}
