import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import session from 'express-session';

import authRoutes from './routes/auth';
import grievanceRoutes from './routes/grievances';
import zoneRoutes from './routes/zones';
import notificationRoutes from './routes/notifications';
import analyticsRoutes from './routes/analytics';
import aiRoutes from './routes/ai';
import { initWebSocket } from './websocket';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'ghmc_session_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // http
    maxAge: 24 * 3600 * 1000 // 24 hours
  }
}));

// API Routes (matching Spring Boot API paths)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/grievances', grievanceRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);

// Static file serving for Frontend UI (/src/main/resources/static)
const staticPath = path.join(__dirname, '../../src/main/resources/static');
app.use(express.static(staticPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Create HTTP server & initialize WebSocket
const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 GHMC Governance Portal (Node.js + Prisma ORM) running on http://localhost:${PORT}`);
  console.log(`📂 Static Frontend served from: ${staticPath}`);
});
