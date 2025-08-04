import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createErrorResponse } from '../utils/helpers';
import { AuthenticatedUser } from '../types';

interface JWTPayload {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json(createErrorResponse('Access token is required', 'MISSING_TOKEN'));
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    const user: AuthenticatedUser = {
      id: decoded.id,
      email: decoded.email
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json(createErrorResponse('Token has expired', 'TOKEN_EXPIRED'));
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json(createErrorResponse('Invalid token', 'INVALID_TOKEN'));
      return;
    }

    res.status(500).json(createErrorResponse('Token verification failed', 'TOKEN_VERIFICATION_ERROR'));
  }
};
