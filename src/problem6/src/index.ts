/**
 * Live Scoreboard System - Main Entry Point
 */

import { initializeDatabase, setupDefaultActions } from './database';
import { cacheService } from './cache';
import { createApp } from './app';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    console.log('🚀 Starting Live Scoreboard System...\n');

    // Initialize database
    console.log('📦 Initializing database...');
    const db = await initializeDatabase();

    // Setup default actions
    console.log('⚙️  Setting up default actions...');
    await setupDefaultActions(db);

    // Connect to Redis
    console.log('📍 Connecting to Redis cache...');
    await cacheService.connect();

    // Verify Redis connection
    const redisHealth = await cacheService.ping();
    console.log(`✓ Redis connected: ${redisHealth}\n`);

    // Create Express app and WebSocket server
    console.log('🏗️  Setting up Express server...');
    const { server, io } = createApp(db);

    // Start server
    server.listen(PORT, () => {
      console.log(`\n✅ Server running at http://localhost:${PORT}`);
      console.log(`📚 WebSocket endpoint: ws://localhost:${PORT}`);
      console.log('\n📋 API Endpoints:');
      console.log('   GET    /health');
      console.log('   GET    /api/scores/top10');
      console.log('   POST   /api/scores/update (requires JWT)');
      console.log('   GET    /api/scores/user/:userId');
      console.log('\n🎯 Features:');
      console.log('   - Real-time score updates via WebSocket');
      console.log('   - Redis caching for top 10 scores');
      console.log('   - JWT authentication');
      console.log('   - Idempotency protection');
      console.log('\n');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down gracefully...');

      server.close(async () => {
        await cacheService.disconnect();
        db.close((err) => {
          if (err) console.error('Database error:', err);
          console.log('✓ All connections closed');
          process.exit(0);
        });
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Force shutting down...');
        process.exit(1);
      }, 10000);
    });
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
}

start();
