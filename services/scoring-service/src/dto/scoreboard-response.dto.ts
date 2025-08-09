import { IsString, IsNumber, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class PlayerScoreDto {
  @IsUUID()
  playerId: string;

  @IsNumber()
  score: number;

  @IsString()
  updatedAt: string;
}

export class ScoreboardResponseDto {
  @IsUUID()
  quizId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerScoreDto)
  players: PlayerScoreDto[];
}
