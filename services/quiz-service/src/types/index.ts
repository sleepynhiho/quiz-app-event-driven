export interface Question {
  id?: string;
  content: string;
  options: string[];
  correctAnswer: number;
  quizId?: string;
}

export interface Quiz {
  id?: string;
  title: string;
  code?: string;
  hostId: string;
  createdAt?: Date;
  questions?: Question[];
}

export interface CreateQuizRequest {
  title: string;
  questions: Array<{
    content: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export interface CreateQuizResponse {
  quizId: string;
  code: string;
  title: string;
  questions: Question[];
}

export interface KafkaQuizCreatedEvent {
  quizId: string;
  title: string;
  hostId: string;
}

export interface KafkaPlayerJoinedEvent {
  playerId: string;
  quizId: string;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
