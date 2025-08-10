import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  SubmitAnswerRequest,
  Answer,
  PlayerScore,
  JoinQuizRequest,
  CreateQuizRequest,
  Quiz,
  User,
  QuizWithQuestions
} from '../types';

// API base URLs
const USER_SERVICE_URL = 'http://localhost:3000';
const QUIZ_SERVICE_URL = 'http://localhost:3001/api';
const ANSWER_SERVICE_URL = 'http://localhost:3002/api';
const SCORING_SERVICE_URL = 'http://localhost:3003/api';

// Create axios instance with default config
const api = axios.create({
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock authentication function
const mockAuth = (email: string, password: string, isRegister: boolean, username?: string): AuthResponse => {
  // Simple validation
  if (!email || !password) {
    throw new Error('Email và mật khẩu không được để trống');
  }

  if (isRegister && !username) {
    throw new Error('Tên người dùng không được để trống');
  }

  // Demo credentials
  if (!isRegister && email === 'demo@quiz.com' && password === 'demo123') {
    return {
      user: {
        id: 'demo-user-123',
        username: 'Demo User',
        email: 'demo@quiz.com'
      },
      token: 'mock-jwt-token-demo'
    };
  }

  // Create mock user
  const user: User = {
    id: uuidv4(),
    username: isRegister ? username! : email.split('@')[0],
    email: email
  };

  return {
    user,
    token: `mock-jwt-token-${user.id}`
  };
};

// Mock quiz functions
const mockCreateQuiz = (data: CreateQuizRequest): Quiz => {
  return {
    id: uuidv4(),
    title: data.title,
    code: `QUIZ${Date.now().toString().slice(-4)}`,
    hostId: 'mock-host-id',
    createdAt: new Date().toISOString()
  };
};

const mockGetQuiz = (quizId: string): QuizWithQuestions => {
  return {
    id: quizId,
    title: 'Quiz được tạo từ Mock Service',
    code: `QUIZ${Date.now().toString().slice(-4)}`,
    hostId: 'mock-host-id',
    createdAt: new Date().toISOString(),
    questions: mockGetDemoQuiz().questions
  };
};

const mockGetDemoQuiz = (): QuizWithQuestions => {
  return {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Demo Quiz - Kiến thức tổng hợp',
    code: 'DEMO2024',
    hostId: 'demo-host-123',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: uuidv4(),
        content: "Thủ đô của Việt Nam là gì?",
        options: ["A) Hà Nội", "B) TP.HCM", "C) Đà Nẵng", "D) Huế"],
        correctAnswer: 0, // Index của "A) Hà Nội"
        order: 1,
        quizId: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        id: uuidv4(),
        content: "2 + 2 = ?",
        options: ["A) 4", "B) 5", "C) 6", "D) 3"],
        correctAnswer: 0, // Index của "A) 4"
        order: 2,
        quizId: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        id: uuidv4(),
        content: "Ngôn ngữ lập trình nào được sử dụng để tạo React?",
        options: ["A) JavaScript", "B) Python", "C) Java", "D) C++"],
        correctAnswer: 0, // Index của "A) JavaScript"
        order: 3,
        quizId: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        id: uuidv4(),
        content: "HTTP viết tắt của gì?",
        options: ["A) HyperText Transfer Protocol", "B) Home Tool Transfer Protocol", "C) Hyperlink Text Protocol", "D) High Transfer Protocol"],
        correctAnswer: 0, // Index của "A) HyperText Transfer Protocol"
        order: 4,
        quizId: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        id: uuidv4(),
        content: "Microservices là gì?",
        options: ["A) Kiến trúc phần mềm chia ứng dụng thành các service nhỏ", "B) Loại database", "C) Ngôn ngữ lập trình", "D) Framework frontend"],
        correctAnswer: 0, // Index của "A) Kiến trúc phần mềm chia ứng dụng thành các service nhỏ"
        order: 5,
        quizId: '550e8400-e29b-41d4-a716-446655440001'
      }
    ]
  };
};

// User Service APIs (with fallback to mock)
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${USER_SERVICE_URL}/auth/login`, data);
      return response.data;
    } catch (error) {
      // Fallback to mock authentication
      console.warn('User Service not available, using mock auth');
      return mockAuth(data.email, data.password, false);
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${USER_SERVICE_URL}/auth/register`, data);
      return response.data;
    } catch (error) {
      // Fallback to mock authentication
      console.warn('User Service not available, using mock auth');
      return mockAuth(data.email, data.password, true, data.username);
    }
  },

  joinQuiz: async (data: JoinQuizRequest): Promise<{ message: string }> => {
    const response = await api.post(`${USER_SERVICE_URL}/quiz/join`, data);
    return response.data;
  },

  getMyQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get(`${USER_SERVICE_URL}/quiz/my-quizzes`);
    return response.data;
  }
};

// Quiz Service APIs (with fallback to mock)
export const quizApi = {
  getAllQuizzes: async (hostId?: string): Promise<Quiz[]> => {
    try {
      const params = hostId ? `?hostId=${hostId}` : '';
      const response = await api.get(`${QUIZ_SERVICE_URL}/quiz${params}`);
      return response.data.data || response.data; // Handle both response formats
    } catch (error) {
      console.warn('Quiz Service not available for getAllQuizzes, returning empty array');
      return [];
    }
  },

  createQuiz: async (data: CreateQuizRequest): Promise<Quiz> => {
    try {
      const response = await api.post(`${QUIZ_SERVICE_URL}/quiz/create`, data);
      return response.data;
    } catch (error) {
      console.warn('Quiz Service not available, using mock quiz creation');
      return mockCreateQuiz(data);
    }
  },

  getQuiz: async (quizId: string): Promise<QuizWithQuestions> => {
    try {
      const response = await api.get(`${QUIZ_SERVICE_URL}/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      console.warn('Quiz Service not available, using mock quiz data');
      return mockGetQuiz(quizId);
    }
  },

  getDemoQuiz: async (questionLimit?: number, randomize?: boolean): Promise<QuizWithQuestions> => {
    try {
      const params = new URLSearchParams();
      if (questionLimit) params.append('limit', questionLimit.toString());
      if (randomize) params.append('random', 'true');
      
      const response = await api.get(`${QUIZ_SERVICE_URL}/quiz/demo?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('Quiz Service not available, using mock demo quiz');
      return mockGetDemoQuiz();
    }
  },

  startQuiz: async (quizId: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`${QUIZ_SERVICE_URL}/quiz/${quizId}/start`);
      return response.data;
    } catch (error) {
      console.warn('Quiz Service not available, using mock start');
      return { message: 'Quiz started (mock)' };
    }
  },

  nextQuestion: async (quizId: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`${QUIZ_SERVICE_URL}/quiz/${quizId}/next`);
      return response.data;
    } catch (error) {
      console.warn('Quiz Service not available, using mock next');
      return { message: 'Next question (mock)' };
    }
  },

  getHealth: async () => {
    const response = await api.get(`${QUIZ_SERVICE_URL}/health`);
    return response.data;
  }
};

// Answer Service APIs  
export const answerApi = {
  submitAnswer: async (data: SubmitAnswerRequest): Promise<Answer> => {
    const response = await api.post(`${ANSWER_SERVICE_URL}/answer/submit`, data);
    return response.data;
  },

  getPlayerAnswers: async (playerId: string, quizId: string): Promise<Answer[]> => {
    const response = await api.get(`${ANSWER_SERVICE_URL}/answer/player/${playerId}/quiz/${quizId}`);
    return response.data;
  },

  getQuestionAnswers: async (questionId: string): Promise<Answer[]> => {
    const response = await api.get(`${ANSWER_SERVICE_URL}/answer/question/${questionId}`);
    return response.data;
  },

  getHealth: async () => {
    const response = await api.get(`${ANSWER_SERVICE_URL}/health`);
    return response.data;
  }
};

// Scoring Service APIs
export const scoringApi = {
  getPlayerScore: async (playerId: string, quizId: string): Promise<PlayerScore> => {
    const response = await api.get(`${SCORING_SERVICE_URL}/scores/player/${playerId}/quiz/${quizId}`);
    return response.data;
  },

  getLeaderboard: async (quizId: string, limit: number = 10): Promise<PlayerScore[]> => {
    const response = await api.get(`${SCORING_SERVICE_URL}/scores/quiz/${quizId}/leaderboard?limit=${limit}`);
    return response.data;
  },

  getHealth: async () => {
    const response = await api.get(`${SCORING_SERVICE_URL}/health`);
    return response.data;
  }
};

// Health check for all services
export const healthApi = {
  checkAllServices: async () => {
    const results = {
      userService: false,
      quizService: false,
      answerService: false,
      scoringService: false
    };

    try {
      await api.get(`${USER_SERVICE_URL}/health`);
      results.userService = true;
    } catch (error) {
      console.error('User Service health check failed:', error);
    }

    try {
      await quizApi.getHealth();
      results.quizService = true;
    } catch (error) {
      console.error('Quiz Service health check failed:', error);
    }

    try {
      await answerApi.getHealth();
      results.answerService = true;
    } catch (error) {
      console.error('Answer Service health check failed:', error);
    }

    try {
      await scoringApi.getHealth();
      results.scoringService = true;
    } catch (error) {
      console.error('Scoring Service health check failed:', error);
    }

    return results;
  }
}; 