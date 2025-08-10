export class AnswerSubmittedDto {
  playerId: string;
  quizId: string;
  questionId: string;
  isCorrect: boolean;
  submittedAt: string; // ISO timestamp
} 