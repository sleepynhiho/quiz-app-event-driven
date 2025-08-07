import dotenv from 'dotenv';
dotenv.config();

// Import type augmentations first
import './types';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './api/routes';
import { database } from './db/database';
import { kafkaProducer } from './kafka/producer';
import { kafkaConsumer } from './kafka/consumer';
import { createErrorResponse } from './utils/helpers';

// Load environment variables

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Quiz Service',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(createErrorResponse(
    `Route ${req.method} ${req.originalUrl} not found`,
    'ROUTE_NOT_FOUND'
  ));
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json(createErrorResponse(
    'Internal server error',
    'INTERNAL_SERVER_ERROR'
  ));
});

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing gracefully...');
  
  try {
    await kafkaConsumer.stop();
    await kafkaConsumer.disconnect();
    await kafkaProducer.disconnect();
    await database.close();
    console.log('Resources cleaned up successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Initialize database schema
    await database.initSchema();
    
    // Connect Kafka producer
    await kafkaProducer.connect();
    
    // Start Kafka consumer
    await kafkaConsumer.startConsuming();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Quiz Service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Kafka consumer listening for player.joined events');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
