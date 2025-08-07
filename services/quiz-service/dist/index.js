"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import type augmentations first
require("./types");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./api/routes"));
const database_1 = require("./db/database");
const producer_1 = require("./kafka/producer");
const consumer_1 = require("./kafka/consumer");
const helpers_1 = require("./utils/helpers");
// Load environment variables
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api', routes_1.default);
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
    res.status(404).json((0, helpers_1.createErrorResponse)(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
});
// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    if (res.headersSent) {
        return next(error);
    }
    res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error', 'INTERNAL_SERVER_ERROR'));
});
// Graceful shutdown handler
const gracefulShutdown = async () => {
    console.log('Received shutdown signal, closing gracefully...');
    try {
        await consumer_1.kafkaConsumer.stop();
        await consumer_1.kafkaConsumer.disconnect();
        await producer_1.kafkaProducer.disconnect();
        await database_1.database.close();
        console.log('Resources cleaned up successfully');
        process.exit(0);
    }
    catch (error) {
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
        await database_1.database.initSchema();
        // Connect Kafka producer
        await producer_1.kafkaProducer.connect();
        // Start Kafka consumer
        await consumer_1.kafkaConsumer.startConsuming();
        // Start the server
        app.listen(PORT, () => {
            console.log(`Quiz Service running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('Kafka consumer listening for player.joined events');
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map