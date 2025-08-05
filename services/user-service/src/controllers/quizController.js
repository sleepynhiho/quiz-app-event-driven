import { QuizService } from '../services/quizService.js';

export class QuizController {
  static async joinQuiz(req, res) {
    try {
      const { quizId } = req.body;
      const { id: playerId } = req.user;

      const result = await QuizService.joinQuiz(playerId, quizId);
      
      res.status(201).json({
        success: true,
        message: 'Successfully joined quiz',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getPlayerQuizzes(req, res) {
    try {
      const { id: playerId } = req.user;
      const quizzes = await QuizService.getPlayerQuizzes(playerId);
      
      res.status(200).json({
        success: true,
        data: quizzes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async checkQuizJoinStatus(req, res) {
    try {
      const { id: playerId } = req.user;
      const { quizId } = req.params;
      
      const hasJoined = await QuizService.hasPlayerJoinedQuiz(playerId, quizId);
      
      res.status(200).json({
        success: true,
        data: {
          quizId,
          hasJoined,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
} 