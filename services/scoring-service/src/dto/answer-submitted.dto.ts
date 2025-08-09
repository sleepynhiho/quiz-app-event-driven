import { IsString, IsBoolean, IsDateString, IsUUID } from 'class-validator';

export class AnswerSubmittedDto {
  @IsUUID()
  playerId: string;

  @IsUUID()
  quizId: string;

  @IsUUID()
  questionId: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsDateString()
  submittedAt: string;
}
