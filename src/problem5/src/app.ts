/**
 * Express app factory - separated from server entry point for testing
 */

import express, { Express, Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { createUserRoutes } from './routes/users';

export function createApp(db: sqlite3.Database): Express {
    const app = express();

    // Middleware
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
        });
    });

    // Register routes
    app.use('/api/users', createUserRoutes(db));

    // 404 handler
    app.use((req: Request, res: Response) => {
        res.status(404).json({
            error: 'Not Found',
            path: req.path,
        });
    });

    // Error handler
    app.use((err: any, req: Request, res: Response) => {
        console.error('Server error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
        });
    });

    return app;
}
