import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { ScoringService } from '../services/scoring.service';
import { PlayerScore } from '../entities/player-score.entity';
import { ScoreboardResponseDto } from '../dto/scoreboard-response.dto';

@Controller('scores')
export class ScoreController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get('player/:playerId/quiz/:quizId')
  async getPlayerScore(
    @Param('playerId') playerId: string,
    @Param('quizId') quizId: string,
  ): Promise<PlayerScore | null> {
    return this.scoringService.getPlayerScore(playerId, quizId);
  }

  @Get('quiz/:quizId/leaderboard')
  async getQuizLeaderboard(
    @Param('quizId') quizId: string,
    @Query('limit') limit?: string,
  ): Promise<PlayerScore[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.scoringService.getQuizLeaderboard(quizId, limitNum);
  }

  @Get('scoreboard/:quizId')
  async getScoreboard(
    @Param('quizId') quizId: string,
  ): Promise<ScoreboardResponseDto> {
    // Validate that quizId is a valid UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quizId)) {
      throw new BadRequestException('Invalid UUID format for quizId');
    }

    const playerScores = await this.scoringService.getQuizLeaderboard(quizId, 100); // Get all players
    
    const players = playerScores.map(score => ({
      playerId: score.playerId,
      score: score.score,
      updatedAt: score.updatedAt.toISOString(),
    }));

    return {
      quizId,
      players,
    };
  }
}
