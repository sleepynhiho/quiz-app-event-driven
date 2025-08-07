"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = generateUUID;
exports.generateQuizCode = generateQuizCode;
exports.isValidEmail = isValidEmail;
exports.createErrorResponse = createErrorResponse;
exports.createSuccessResponse = createSuccessResponse;
const uuid_1 = require("uuid");
/**
 * Generate a unique UUID
 */
function generateUUID() {
    return (0, uuid_1.v4)();
}
/**
 * Generate a random 6-character quiz code
 */
function generateQuizCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Create error response object
 */
function createErrorResponse(message, code, details) {
    return {
        error: {
            message,
            code,
            details,
            timestamp: new Date().toISOString()
        }
    };
}
/**
 * Create success response object
 */
function createSuccessResponse(data, message) {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
}
//# sourceMappingURL=helpers.js.map