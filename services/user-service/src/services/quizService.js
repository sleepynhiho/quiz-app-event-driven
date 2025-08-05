import PlayerQuiz from '../models/PlayerQuiz.js';
import { publishPlayerJoined } from '../utils/kafka.js';

export class QuizService {
  static async joinQuiz(playerId, quizId) {
    // Check if player already joined this quiz
    const existingJoin = await PlayerQuiz.findByPlayerAndQuiz(playerId, quizId);
    if (existingJoin) {
      throw new Error('Player has already joined this quiz');
    }

    // Create player quiz record
    const playerQuiz = await PlayerQuiz.create({
      playerId,
      quizId,
    });

    // Publish Kafka message (don't fail the request if Kafka is down)
    try {
      await publishPlayerJoined(playerId, quizId);
    } catch (error) {
      console.error('Failed to publish Kafka message:', error);
      // Don't throw error, just log it - the quiz join should still succeed
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