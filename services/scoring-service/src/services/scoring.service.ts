import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerScore } from '../entities/player-score.entity';
import { AnswerSubmittedDto } from '../dto/answer-submitted.dto';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);
  
  // In-memory tracking for correct answer order per question
  private correctAnswerOrder = new Map<string, string[]>(); // questionId -> [playerId1, playerId2, ...]
  
  // Cache for question start times (in a real app, this might come from Redis or database)
  private questionStartTimes = new Map<string, Date>(); // questionId -> start time

  constructor(
    @InjectRepository(PlayerScore)
    private readonly playerScoreRepository: Repository<PlayerScore>,
  ) {}

  async processAnswerSubmitted(answerData: AnswerSubmittedDto): Promise<void> {
    try {
      this.logger.log(`Processing answer for player ${answerData.playerId} in quiz ${answerData.quizId}`);

      const score = this.calculateScore(answerData);
      
      this.logger.log(`Calculated score: ${score} points for player ${answerData.playerId}`);

      // Update or create player score record
      await this.updatePlayerScore(answerData.playerId, answerData.quizId, score);

    } catch (error) {
      this.logger.error(`Error processing answer for player ${answerData.playerId}:`, error);
      throw error;
    }
  }

  private calculateScore(answerData: AnswerSubmittedDto): number {
    // If answer is incorrect, score is 0
    if (!answerData.isCorrect) {
      this.logger.log(`Incorrect answer for player ${answerData.playerId} - score: 0`);
      return 0;
    }

    // Default question weight to 1 if not provided
    const questionWeight = answerData.questionWeight || 1;
    
    // Base score calculation
    const baseScore = 100 * questionWeight;
    this.logger.log(`Base score: ${baseScore} (100 * ${questionWeight})`);

    // Time bonus calculation
    const timeBonus = this.calculateTimeBonus(answerData);
    this.logger.log(`Time bonus: ${timeBonus}`);

    // Order bonus calculation
    const orderBonus = this.calculateOrderBonus(answerData);
    this.logger.log(`Order bonus: ${orderBonus}`);

    const totalScore = baseScore + timeBonus + orderBonus;
    this.logger.log(`Total score: ${totalScore} (${baseScore} + ${timeBonus} + ${orderBonus})`);
    
    return totalScore;
  }

  private calculateTimeBonus(answerData: AnswerSubmittedDto): number {
    try {
      const submittedAt = new Date(answerData.submittedAt);
      const deadline = new Date(answerData.deadline);
      
      // For time bonus calculation, we need the question start time
      // In a real implementation, this would be stored when the question is presented
      // For now, we'll estimate it as deadline - 30 seconds (typical question duration)
      const questionDuration = 30 * 1000; // 30 seconds in milliseconds
      const questionPresentedAt = new Date(deadline.getTime() - questionDuration);
      
      // Store the question start time for future reference
      this.questionStartTimes.set(answerData.questionId, questionPresentedAt);

      const totalQuestionTime = deadline.getTime() - questionPresentedAt.getTime();
      const timeRemaining = deadline.getTime() - submittedAt.getTime();
      
      if (timeRemaining <= 0 || totalQuestionTime <= 0) {
        return 0; // No bonus if submitted after deadline or invalid times
      }

      const timeRatio = timeRemaining / totalQuestionTime;
      const timeBonus = Math.floor(timeRatio * 50); // Round down as requested
      
      return Math.max(0, timeBonus);
    } catch (error) {
      this.logger.warn(`Error calculating time bonus: ${error.message}`);
      return 0;
    }
  }

  private calculateOrderBonus(answerData: AnswerSubmittedDto): number {
    const questionId = answerData.questionId;
    const playerId = answerData.playerId;

    // Get current correct answers for this question
    let correctAnswers = this.correctAnswerOrder.get(questionId) || [];
    
    // Check if this player already answered correctly (avoid duplicates)
    if (correctAnswers.includes(playerId)) {
      this.logger.log(`Player ${playerId} already answered question ${questionId} correctly`);
      return 0;
    }

    // Add this player to the correct answers list
    correctAnswers.push(playerId);
    this.correctAnswerOrder.set(questionId, correctAnswers);

    // Determine order bonus
    const position = correctAnswers.length;
    let orderBonus = 0;
    
    switch (position) {
      case 1:
        orderBonus = 20; // First correct answer
        break;
      case 2:
        orderBonus = 10; // Second correct answer
        break;
      default:
        orderBonus = 0; // Third and later get no bonus
        break;
    }

    this.logger.log(`Player ${playerId} is ${position}${this.getOrdinalSuffix(position)} to answer correctly - bonus: ${orderBonus}`);
    
    return orderBonus;
  }

  private getOrdinalSuffix(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
  }

  private async updatePlayerScore(playerId: string, quizId: string, scoreToAdd: number): Promise<void> {
    // Find existing player score record
    let playerScore = await this.playerScoreRepository.findOne({
      where: {
        playerId,
        quizId,
      },
    });

    if (playerScore) {
      // Increment existing score
      playerScore.score += scoreToAdd;
      // updatedAt will be automatically updated by TypeORM's @UpdateDateColumn
      await this.playerScoreRepository.save(playerScore);
      
      this.logger.log(
        `Updated score for player ${playerId}: ${playerScore.score} points (added ${scoreToAdd})`
      );
    } else {
      // Create new player score record
      playerScore = this.playerScoreRepository.create({
        playerId,
        quizId,
        score: scoreToAdd,
      });

      await this.playerScoreRepository.save(playerScore);
      
      this.logger.log(
        `Created new score record for player ${playerId}: ${scoreToAdd} points`
      );
    }
  }

  // Method to cleanup question tracking data after question ends
  public cleanupQuestion(questionId: string): void {
    this.correctAnswerOrder.delete(questionId);
    this.questionStartTimes.delete(questionId);
    this.logger.log(`Cleaned up tracking data for question ${questionId}`);
  }

  // Method to reset all tracking (useful for testing or quiz reset)
  public resetTracking(): void {
    this.correctAnswerOrder.clear();
    this.questionStartTimes.clear();
    this.logger.log('Reset all scoring tracking data');
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

  // Method to get current question statistics (useful for debugging)
  public getQuestionStats(questionId: string): { 
    correctCount: number; 
    correctPlayers: string[]; 
    startTime: Date | undefined 
  } {
    return {
      correctCount: this.correctAnswerOrder.get(questionId)?.length || 0,
      correctPlayers: this.correctAnswerOrder.get(questionId) || [],
      startTime: this.questionStartTimes.get(questionId)
    };
  }
}
