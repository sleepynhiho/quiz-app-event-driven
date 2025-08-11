import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { QuizPlayer } from '../entities/quiz-player.entity';
import { CreateQuizDto } from '../dto/quiz.dto';
import { KafkaService } from './kafka.service';
import { RedisService } from './redis.service';
import { QuizGateway } from '../gateways/quiz.gateway';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(QuizPlayer)
    private quizPlayerRepository: Repository<QuizPlayer>,
    @Inject(forwardRef(() => KafkaService))
    private kafkaService: KafkaService,
    private redisService: RedisService,
    @Inject(forwardRef(() => QuizGateway))
    private quizGateway: QuizGateway,
  ) {}

  async getAllQuizzes(hostId?: string) {
    const whereCondition = hostId ? { hostId } : {};
    
    const quizzes = await this.quizRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });

    // Get question count separately for each quiz to avoid relation issues
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionCount = await this.questionRepository.count({
          where: { quizId: quiz.id }
        });
        
        return {
          id: quiz.id,
          title: quiz.title,
          code: quiz.code,
          hostId: quiz.hostId,
          createdAt: quiz.createdAt,
          questionsCount: questionCount,
        };
      })
    );

    return quizzesWithCount;
  }

  async getDemoQuiz(questionLimit?: number, randomize?: boolean) {
    // Generate fresh demo quiz with unique IDs
    const quizId = uuidv4();
    
    // Demo questions dataset
    let allQuestions = [
      {
        id: uuidv4(),
        content: "What is the capital of Vietnam?",
        options: ["A) Hanoi", "B) Ho Chi Minh City", "C) Da Nang", "D) Hue"],
        correctAnswer: 0, // A) Hanoi
        order: 1,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "2 + 2 = ?",
        options: ["A) 4", "B) 5", "C) 6", "D) 3"],
        correctAnswer: 0, // A) 4
        order: 2,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "Which programming language is used to create React?",
        options: ["A) JavaScript", "B) Python", "C) Java", "D) C++"],
        correctAnswer: 0, // A) JavaScript
        order: 3,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "What does HTTP stand for?",
        options: ["A) HyperText Transfer Protocol", "B) Home Tool Transfer Protocol", "C) Hyperlink Text Protocol", "D) High Transfer Protocol"],
        correctAnswer: 0, // A) HyperText Transfer Protocol
        order: 4,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "What are Microservices?",
        options: ["A) Software architecture that divides apps into small services", "B) Type of database", "C) Programming language", "D) Frontend framework"],
        correctAnswer: 0, // A) Software architecture
        order: 5,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "PostgreSQL là loại database gì?",
        options: ["A) Relational Database", "B) NoSQL Database", "C) Graph Database", "D) Key-Value Store"],
        correctAnswer: 0, // Index của "A) Relational Database"
        order: 6,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "Kafka được sử dụng để làm gì?",
        options: ["A) Message Streaming", "B) Web Server", "C) Database", "D) Authentication"],
        correctAnswer: 0, // Index của "A) Message Streaming"
        order: 7,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "Docker được dùng để?",
        options: ["A) Containerization", "B) Database Management", "C) Web Development", "D) Machine Learning"],
        correctAnswer: 0, // Index của "A) Containerization"
        order: 8,
        quizId: quizId
      }
    ];

    // Apply randomization if requested
    if (randomize) {
      allQuestions = this.shuffleArray(allQuestions);
      // Re-assign order after shuffle
      allQuestions.forEach((q, index) => q.order = index + 1);
    }

    // Apply question limit if specified
    const questions = questionLimit ? allQuestions.slice(0, questionLimit) : allQuestions;

    const demoQuiz = {
      id: quizId,
      title: `Demo Quiz - ${randomize ? 'Random' : 'Standard'} (${questions.length} questions)`,
      code: `DEMO${Date.now().toString().slice(-4)}`, // Dynamic demo code
      hostId: 'demo-host-123',
      createdAt: new Date().toISOString(),
      questions: questions
    };

    return demoQuiz;
  }

  // Fisher-Yates shuffle algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async getQuizWithQuestions(quizId: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId }
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const questions = await this.questionRepository.find({
      where: { quizId },
      order: { order: 'ASC' }
    });

    return {
      ...quiz,
      questions
    };
  }

  async createQuiz(hostId: string, createQuizDto: CreateQuizDto): Promise<Quiz> {
    // Generate unique quiz code
    const code = this.generateQuizCode();
    
    // Create quiz entity
    const quiz = this.quizRepository.create({
      id: uuidv4(),
      hostId,
      code,
      title: createQuizDto.title,
    });
    
    const savedQuiz = await this.quizRepository.save(quiz);

    // Create question entities
    const questions = createQuizDto.questions.map((questionDto, index) => {
      return this.questionRepository.create({
        id: uuidv4(),
        quizId: savedQuiz.id,
        content: questionDto.content,
        options: questionDto.options,
        correctAnswer: questionDto.correctAnswer,
        order: index + 1,
      });
    });

    await this.questionRepository.save(questions);

    return savedQuiz;
  }

  async startQuiz(quizId: string): Promise<void> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['questions'],
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Initialize quiz state in Redis
    await this.redisService.setJson(`quiz:${quizId}:state`, {
      status: 'started',
      currentQuestionIndex: 0,
      startedAt: new Date(),
    });

    // Publish to Kafka
    await this.kafkaService.publish('quiz.started', { quizId });

    // Broadcast to WebSocket clients
    this.quizGateway.broadcastToQuiz(quizId, 'quiz.started', { quizId });

    // Present first question
    await this.presentNextQuestion(quizId);
  }

  async presentNextQuestion(quizId: string): Promise<void> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['questions'],
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const quizState = await this.redisService.getJson<any>(`quiz:${quizId}:state`);
    if (!quizState) {
      throw new Error('Quiz not started');
    }

    const currentIndex = quizState.currentQuestionIndex;
    const questions = quiz.questions.sort((a, b) => a.order - b.order);

    if (currentIndex >= questions.length) {
      // No more questions - end quiz
      await this.endQuiz(quizId);
      return;
    }

    const currentQuestion = questions[currentIndex];
    const deadline = new Date(Date.now() + 30000); // 30 second timer

    // Update state with current question
    await this.redisService.setJson(`quiz:${quizId}:state`, {
      ...quizState,
      currentQuestionIndex: currentIndex,
      currentQuestionId: currentQuestion.id,
      questionDeadline: deadline,
    });

    // Prepare question data
    const questionData = {
      quizId,
      questionId: currentQuestion.id,
      content: currentQuestion.content,
      options: currentQuestion.options,
      deadline,
    };
    
    // Publish to Kafka
    await this.kafkaService.publish('question.presented', questionData);

    // Broadcast to WebSocket clients
    this.quizGateway.broadcastToQuiz(quizId, 'question.presented', questionData);

    // Schedule timeout
    setTimeout(() => {
      this.timeUp(quizId, currentQuestion.id);
    }, 30000);
  }

  async nextQuestion(quizId: string): Promise<void> {
    const quizState = await this.redisService.getJson<any>(`quiz:${quizId}:state`);
    if (!quizState) {
      throw new Error('Quiz not started');
    }

    // Increment question index
    quizState.currentQuestionIndex += 1;
    await this.redisService.setJson(`quiz:${quizId}:state`, quizState);

    await this.presentNextQuestion(quizId);
  }

  private async timeUp(quizId: string, questionId: string): Promise<void> {
    const timeUpData = { quizId, questionId };
    await this.kafkaService.publish('time.up', timeUpData);
    
    // Broadcast to WebSocket clients
    this.quizGateway.broadcastToQuiz(quizId, 'time.up', timeUpData);
  }

  private async endQuiz(quizId: string): Promise<void> {
    // Collect final scores
    const players = await this.quizPlayerRepository.find({
      where: { quizId },
    });

    const result = players.map(player => ({
      playerId: player.playerId,
      score: player.score,
    }));

    // Mark quiz as ended
    await this.redisService.setJson(`quiz:${quizId}:state`, {
      status: 'ended',
      endedAt: new Date(),
    });

    // Publish and broadcast end event
    const endData = { quizId, result };
    await this.kafkaService.publish('quiz.ended', endData);
    this.quizGateway.broadcastToQuiz(quizId, 'quiz.ended', endData);
  }

  private generateQuizCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async getQuizByCode(code: string): Promise<Quiz | null> {
    return await this.quizRepository.findOne({ where: { code } });
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    return await this.quizRepository.findOne({
      where: { id },
      relations: ['questions', 'players'],
    });
  }

  async getQuestionById(questionId: string): Promise<Question | null> {
    return await this.questionRepository.findOne({
      where: { id: questionId },
    });
  }

  async getQuizState(quizId: string): Promise<any> {
    const state = await this.redisService.getJson<any>(`quiz:${quizId}:state`);
    if (!state) {
      throw new Error('Quiz state not found');
    }
    return state;
  }
}
