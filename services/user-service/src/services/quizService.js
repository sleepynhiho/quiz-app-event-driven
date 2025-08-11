import PlayerQuiz from '../models/PlayerQuiz.js';
import { publishPlayerJoined } from '../utils/kafka.js';

export class QuizService {
  static async joinQuiz(playerId, quizId) {
    // Prevent duplicate joins
    const existingJoin = await PlayerQuiz.findByPlayerAndQuiz(playerId, quizId);
    if (existingJoin) {
      throw new Error('Player has already joined this quiz');
    }

    // Create join record
    const playerQuiz = await PlayerQuiz.create({
      playerId,
      quizId,
    });

    // Publish join event (non-blocking)
    try {
      await publishPlayerJoined(playerId, quizId);
    } catch (error) {
      console.error('Failed to publish Kafka message:', error);
      // Continue - join should succeed even if event fails
    }

    return playerQuiz;
  }

  static async getPlayerQuizzes(playerId) {
    return await PlayerQuiz.findByPlayerId(playerId);
  }

  static async getQuizPlayers(quizId) {
    return await PlayerQuiz.findByQuizId(quizId);
  }

  static async hasPlayerJoinedQuiz(playerId, quizId) {
    const existingJoin = await PlayerQuiz.findByPlayerAndQuiz(playerId, quizId);
    return !!existingJoin;
  }
} 