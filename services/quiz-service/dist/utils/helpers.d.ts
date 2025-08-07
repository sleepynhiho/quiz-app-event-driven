/**
 * Generate a unique UUID
 */
export declare function generateUUID(): string;
/**
 * Generate a random 6-character quiz code
 */
export declare function generateQuizCode(): string;
/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Create error response object
 */
export declare function createErrorResponse(message: string, code?: string, details?: any): {
    error: {
        message: string;
        code: string | undefined;
        details: any;
        timestamp: string;
    };
};
/**
 * Create success response object
 */
export declare function createSuccessResponse(data: any, message?: string): {
    success: boolean;
    message: string | undefined;
    data: any;
    timestamp: string;
};
//# sourceMappingURL=helpers.d.ts.map