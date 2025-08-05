import { Router } from 'express';
import { QuizController } from '../controllers/quizController.js';
import { validate } from '../middleware/validation.js';
import { auth } from '../middleware/auth.js';
import { joinQuizSchema } from '../validations/quiz.js';

const router = Router();

/**
 * @swagger
 * /quiz/join:
 *   post:
 *     summary: Join a quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizId
 *             properties:
 *               quizId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully joined quiz
 *       400:
 *         description: Validation error or already joined
 *       401:
 *         description: Unauthorized
 */
router.post('/join', auth, validate(joinQuizSchema), QuizController.joinQuiz);

/**
 * @swagger
 * /quiz/my-quizzes:
 *   get:
 *     summary: Get user's joined quizzes
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's quizzes
 *       401:
 *         description: Unauthorized
 */
router.get('/my-quizzes', auth, QuizController.getPlayerQuizzes);

/**
 * @swagger
 * /quiz/{quizId}/join-status:
 *   get:
 *     summary: Check if user has joined a specific quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz join status
 *       401:
 *         description: Unauthorized
 */
router.get('/:quizId/join-status', auth, QuizController.checkQuizJoinStatus);

export default router; 