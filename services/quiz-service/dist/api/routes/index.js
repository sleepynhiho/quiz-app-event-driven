"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizRoutes_1 = __importDefault(require("./quizRoutes"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'quiz-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Quiz routes
router.use('/quiz', quizRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map