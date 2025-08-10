import { IsString, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsNotEmpty()
  questions: CreateQuestionDto[];
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsNotEmpty()
  options: string[];

  @IsNumber()
  @IsNotEmpty()
  correctAnswer: number;
}

export class StartQuizDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;
}

export class NextQuestionDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;
}
