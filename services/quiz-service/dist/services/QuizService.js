"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const database_1 = require("../db/database");
const producer_1 = require("../kafka/producer");
const helpers_1 = require("../utils/helpers");
class QuizService {
    async createQuiz(quizData, hostId) {
        try {
            // Generate unique IDs
            const quizId = (0, helpers_1.generateUUID)();
            const quizCode = (0, helpers_1.generateQuizCode)();
            // Prepare questions with UUIDs
            const questions = quizData.questions.map(q => ({
                id: (0, helpers_1.generateUUID)(),
                content: q.content,
                options: q.options,
                correctAnswer: q.correctAnswer,
                quizId: quizId
            }));
            // Prepare quiz object
            const quiz = {
                id: quizId,
                title: quizData.title,
                code: quizCode,
                hostId: hostId,
                questions: questions
            };
            // Save to database
            const createdQuiz = await database_1.database.createQuiz(quiz);
            // Publish Kafka event
            const kafkaEvent = {
                quizId: createdQuiz.id,
                title: createdQuiz.title,
                hostId: createdQuiz.hostId
            };
            await producer_1.kafkaProducer.publishQuizCreated(kafkaEvent);
            // Return response
            return {
                quizId: createdQuiz.id,
                code: createdQuiz.code,
                title: createdQuiz.title,
                questions: createdQuiz.questions || []
            };
        }
        catch (error) {
            console.error('Error creating quiz:', error);
            throw new Error('Failed to create quiz');
        }
    }
}
exports.QuizService = QuizService;
//# sourceMappingURL=QuizService.js.map