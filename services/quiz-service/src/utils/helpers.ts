import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique UUID
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Generate a random 6-character quiz code
 */
export function generateQuizCode(): string {
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
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create error response object
 */
export function createErrorResponse(message: string, code?: string, details?: any) {
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
export function createSuccessResponse(data: any, message?: string) {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}
