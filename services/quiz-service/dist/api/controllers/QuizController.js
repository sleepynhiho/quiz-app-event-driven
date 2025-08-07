"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizController = void 0;
const QuizService_1 = require("../../services/QuizService");
const validation_1 = require("../../utils/validation");
const helpers_1 = require("../../utils/helpers");
class QuizController {
    constructor() {
        this.createQuiz = async (req, res) => {
            try {
                // Check if user is authenticated
                if (!req.user || !req.user.id) {
                    res.status(401).json((0, helpers_1.createErrorResponse)('User not authenticated', 'UNAUTHORIZED'));
                    return;
                }
                // Validate request body
                const { error, value } = (0, validation_1.validateCreateQuiz)(req.body);
                if (error) {
                    const errorDetails = error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }));
                    res.status(400).json((0, helpers_1.createErrorResponse)('Validation failed', 'VALIDATION_ERROR', errorDetails));
                    return;
                }
                const quizData = value;
                const hostId = req.user.id;
                // Create quiz
                const result = await this.quizService.createQuiz(quizData, hostId);
                // Return success response
                res.status(201).json((0, helpers_1.createSuccessResponse)(result, 'Quiz created successfully'));
            }
            catch (error) {
                console.error('Error in createQuiz controller:', error);
                if (error instanceof Error) {
                    res.status(500).json((0, helpers_1.createErrorResponse)(error.message, 'INTERNAL_SERVER_ERROR'));
                }
                else {
                    res.status(500).json((0, helpers_1.createErrorResponse)('An unexpected error occurred', 'INTERNAL_SERVER_ERROR'));
                }
            }
        };
        this.quizService = new QuizService_1.QuizService();
    }
}
exports.QuizController = QuizController;
//# sourceMappingURL=QuizController.js.map