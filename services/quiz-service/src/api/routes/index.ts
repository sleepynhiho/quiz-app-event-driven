import { Router } from 'express';
import quizRoutes from './quizRoutes';

const router = Router();

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
router.use('/quiz', quizRoutes);

export default router;
