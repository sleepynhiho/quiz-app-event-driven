"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const QuizController_1 = require("../controllers/QuizController");
const auth_1 = require("../../utils/auth");
const router = (0, express_1.Router)();
const quizController = new QuizController_1.QuizController();
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
router.post('/create', auth_1.authenticateToken, quizController.createQuiz);
exports.default = router;
//# sourceMappingURL=quizRoutes.js.map