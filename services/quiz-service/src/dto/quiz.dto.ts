import { IsString, IsArray, IsNotEmpty } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;
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
