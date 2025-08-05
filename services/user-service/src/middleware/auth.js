import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required',
      });
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}; 