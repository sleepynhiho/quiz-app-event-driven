import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';
import { authenticateToken } from '../../utils/auth';

const router = Router();
const quizController = new QuizController();

/**
 * @route POST /quiz/create
 * @description Create a new quiz
 * @access Private (requires authentication)
 * @body {
 *   title: string,
 *   questions: Array<{
 *     content: string,
 *     options: string[],
 *     correctAnswer: number
 *   }>
 * }
 * @returns {
 *   quizId: string,
 *   code: string,
 *   title: string,
 *   questions: Question[]
 * }
 */
router.post('/create', authenticateToken, quizController.createQuiz);

export default router;
