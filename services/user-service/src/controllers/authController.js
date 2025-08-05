import { AuthService } from '../services/authService.js';

export class AuthController {
  static async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async login(req, res) {
    try {
      const result = await AuthService.login(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
} 