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

      // Calculate score based on correctness
      const scoreToAdd = answerData.isCorrect ? 10 : 0;

      // Find existing player score record
      let playerScore = await this.playerScoreRepository.findOne({
        where: {
          playerId: answerData.playerId,
          quizId: answerData.quizId,
        },
      });

      if (playerScore) {
        // Increment existing score
        playerScore.score += scoreToAdd;
        await this.playerScoreRepository.save(playerScore);
        
        this.logger.log(
          `Updated score for player ${answerData.playerId}: ${playerScore.score} points (added ${scoreToAdd})`
        );
      } else {
        // Create new player score record
        playerScore = this.playerScoreRepository.create({
          playerId: answerData.playerId,
          quizId: answerData.quizId,
          score: scoreToAdd,
        });

        await this.playerScoreRepository.save(playerScore);
        
        this.logger.log(
          `Created new score record for player ${answerData.playerId}: ${scoreToAdd} points`
        );
      }

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
        score: 'DESC',
        updatedAt: 'ASC', // Earlier update wins ties
      },
      take: limit,
    });
  }
}
