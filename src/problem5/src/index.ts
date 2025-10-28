/**
 * Main server entry point
 * Express server with SQLite database
 */

import { initializeDatabase } from './database';
import { createApp } from './app';

const PORT = process.env.PORT || 3000;

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database
        const db = await initializeDatabase();
        console.log('Database initialized');

        // Create app
        const app = createApp(db);

        // Start server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running at http://localhost:${PORT}`);
            console.log(`📚 API Documentation:`);
            console.log(`   - GET    /health              - Health check`);
            console.log(`   - POST   /api/users            - Create user`);
            console.log(`   - GET    /api/users            - List users (with filters)`);
            console.log(`   - GET    /api/users/:id        - Get user details`);
            console.log(`   - PUT    /api/users/:id        - Update user`);
            console.log(`   - DELETE /api/users/:id        - Delete user`);
            console.log(`\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
