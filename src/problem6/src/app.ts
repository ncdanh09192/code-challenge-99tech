/**
 * Express App with WebSocket Setup
 */

import express from 'express';
import sqlite3 from 'sqlite3';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createRoutes } from './routes';

export function createApp(db: sqlite3.Database): { app: express.Application; server: http.Server; io: SocketIOServer } {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware (BEFORE routes!)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve public static files (JS, CSS) before routes
  const publicPath = path.join(__dirname, '../public');
  console.log(`📂 Serving static files from: ${publicPath}`);
  app.use(express.static(publicPath));

  // Routes
  app.use(createRoutes(db));

  // Global 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      path: req.path
    });
  });

  // WebSocket connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] User connected: ${socket.id}`);

    // Send current top 10 on connection
    socket.emit('connected', {
      type: 'connected',
      message: 'Connected to scoreboard',
      timestamp: new Date().toISOString(),
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[WebSocket] User disconnected: ${socket.id}`);
    });

    // Handle custom events
    socket.on('subscribe_scores', () => {
      socket.join('scoreboard');
      console.log(`[WebSocket] User ${socket.id} subscribed to scoreboard`);
    });

    socket.on('unsubscribe_scores', () => {
      socket.leave('scoreboard');
      console.log(`[WebSocket] User ${socket.id} unsubscribed from scoreboard`);
    });
  });

  // Global broadcast function
  app.locals.broadcastScoreUpdate = (data: any) => {
    io.to('scoreboard').emit('score_updated', {
      type: 'score_updated',
      ...data,
      timestamp: new Date().toISOString(),
    });
  };


  return { app, server, io };
}
