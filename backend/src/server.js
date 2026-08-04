import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDefaultAdmin } from './controllers/authController.js';
import { seedDefaultParagraphs } from './controllers/paragraphController.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

import eventRoutes from './routes/eventRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);


// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_STUDENT_URL || 'http://localhost:5173',
      process.env.CLIENT_ADMIN_URL || 'http://localhost:5174',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_STUDENT_URL || 'http://localhost:5173',
      process.env.CLIENT_ADMIN_URL || 'http://localhost:5174',
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Socket.IO event handler initialization
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_event', (eventId) => {
    socket.join(`event_${eventId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined room event_${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Pass socket.io instance to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount Routes
app.use('/api/events', eventRoutes);
app.use('/api/v1', apiRouter);


// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDefaultAdmin();
  await seedDefaultParagraphs();
  server.listen(PORT, () => {


    console.log(`===========================================`);
    console.log(`🚀 Type Rush Backend Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ API Endpoint: http://localhost:${PORT}/api/v1`);
    console.log(`===========================================`);
  });
};

startServer();
