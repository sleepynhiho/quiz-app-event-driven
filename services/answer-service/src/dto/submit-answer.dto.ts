import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  @IsNotEmpty()
  playerId: string;

  @IsUUID()
  @IsNotEmpty()
  quizId: string;

  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
