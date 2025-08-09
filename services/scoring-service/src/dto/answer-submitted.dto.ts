import { IsString, IsBoolean, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class AnswerSubmittedDto {
  @IsUUID()
  playerId: string;

  @IsUUID()
  quizId: string;

  @IsUUID()
  questionId: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsString()
  submittedAt: string;

  @IsString()
  deadline: string;

  @IsOptional()
  @IsNumber()
  questionWeight?: number;
}
