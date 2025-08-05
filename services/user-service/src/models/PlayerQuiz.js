import prisma from '../database/connection.js';

class PlayerQuiz {
  static async create(playerQuizData) {
    return await prisma.playerQuiz.create({
      data: playerQuizData,
    });
  }

  static async findByPlayerAndQuiz(playerId, quizId) {
    return await prisma.playerQuiz.findUnique({
      where: {
        playerId_quizId: {
          playerId,
          quizId,
        },
      },
    });
  }

  static async findByPlayerId(playerId) {
    return await prisma.playerQuiz.findMany({
      where: { playerId },
      orderBy: { joinedAt: 'desc' },
    });
  }

  static async findByQuizId(quizId) {
    return await prisma.playerQuiz.findMany({
      where: { quizId },
      orderBy: { joinedAt: 'asc' },
    });
  }
}

export default PlayerQuiz; 