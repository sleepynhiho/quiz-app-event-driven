import { Controller, Get, Param, Query } from '@nestjs/common';
import { ScoringService } from '../services/scoring.service';
import { PlayerScore } from '../entities/player-score.entity';

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
}
