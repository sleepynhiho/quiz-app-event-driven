"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helpers_1 = require("../utils/helpers");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json((0, helpers_1.createErrorResponse)('Access token is required', 'MISSING_TOKEN'));
        return;
    }
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = {
            id: decoded.id,
            email: decoded.email
        };
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json((0, helpers_1.createErrorResponse)('Token has expired', 'TOKEN_EXPIRED'));
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(403).json((0, helpers_1.createErrorResponse)('Invalid token', 'INVALID_TOKEN'));
            return;
        }
        res.status(500).json((0, helpers_1.createErrorResponse)('Token verification failed', 'TOKEN_VERIFICATION_ERROR'));
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map