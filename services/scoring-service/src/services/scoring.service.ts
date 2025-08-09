import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerScore } from '../entities/player-score.entity';
import { AnswerSubmittedDto } from '../dto/answer-submitted.dto';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    @InjectRepository(PlayerScore)
    private readonly playerScoreRepository: Repository<PlayerScore>,
  ) {}

  async processAnswerSubmitted(answerData: AnswerSubmittedDto): Promise<void> {
    try {
      this.logger.log(`Processing answer for player ${answerData.playerId} in quiz ${answerData.quizId}`);

      // Find or create player score record
      let playerScore = await this.playerScoreRepository.findOne({
        where: {
          playerId: answerData.playerId,
          quizId: answerData.quizId,
        },
      });

      if (!playerScore) {
        // Create new player score record
        playerScore = this.playerScoreRepository.create({
          playerId: answerData.playerId,
          quizId: answerData.quizId,
          totalScore: 0,
          correctAnswers: 0,
          totalAnswers: 0,
        });
      }

      // Update scores
      playerScore.totalAnswers += 1;
      if (answerData.isCorrect) {
        playerScore.correctAnswers += 1;
        playerScore.totalScore += this.calculatePointsForCorrectAnswer();
      }
      
      playerScore.lastAnsweredAt = new Date(answerData.submittedAt);

      // Save updated score
      await this.playerScoreRepository.save(playerScore);

      this.logger.log(
        `Updated score for player ${answerData.playerId}: ${playerScore.totalScore} points (${playerScore.correctAnswers}/${playerScore.totalAnswers} correct)`
      );

      // TODO: Publish score update event to Kafka
      // await this.kafkaService.publishScoreUpdate(playerScore);

    } catch (error) {
      this.logger.error(`Error processing answer for player ${answerData.playerId}:`, error);
      throw error;
    }
  }

  async getPlayerScore(playerId: string, quizId: string): Promise<PlayerScore | null> {
    return this.playerScoreRepository.findOne({
      where: {
        playerId,
        quizId,
      },
    });
  }

  async getQuizLeaderboard(quizId: string, limit: number = 10): Promise<PlayerScore[]> {
    return this.playerScoreRepository.find({
      where: { quizId },
      order: {
        totalScore: 'DESC',
        lastAnsweredAt: 'ASC', // Earlier submission wins ties
      },
      take: limit,
    });
  }

  private calculatePointsForCorrectAnswer(): number {
    // Simple scoring: 10 points per correct answer
    // This could be enhanced with time-based scoring, difficulty multipliers, etc.
    return 10;
  }
}
