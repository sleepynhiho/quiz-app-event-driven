export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Quiz {
  id: string;
  title: string;
  code: string;
  hostId: string;
  createdAt: string;
}

export interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number; // Đổi từ string sang number để khớp với backend
  order: number;
  quizId?: string;
}

export interface QuizWithQuestions {
  id: string;
  title: string;
  code: string;
  hostId: string;
  createdAt: string;
  questions: Question[];
}

export interface Answer {
  id: string;
  playerId: string;
  quizId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  submittedAt: string;
}

export interface PlayerScore {
  id: string;
  playerId: string;
  quizId: string;
  totalScore: number;
  correctAnswers: number;
  totalAnswers: number;
  lastAnsweredAt: string;
}

export interface SubmitAnswerRequest {
  playerId: string;
  quizId: string;
  questionId: string;
  answer: string;
}

export interface CreateQuizRequest {
  title: string;
  hostId: string;
  questions: {
    content: string;
    options: string[];
    correctAnswer: number; // Đổi từ string sang number
    order: number;
  }[];
}

export interface JoinQuizRequest {
  quizCode: string;
}

// WebSocket Events
export interface QuizStartedEvent {
  quizId: string;
}

export interface QuestionPresentedEvent {
  quizId: string;
  questionId: string;
  content: string;
  options: string[];
  deadline: string;
}

export interface TimeUpEvent {
  quizId: string;
  questionId: string;
}

export interface QuizEndedEvent {
  quizId: string;
  results: PlayerScore[];
} 