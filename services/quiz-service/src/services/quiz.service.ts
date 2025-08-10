import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { QuizPlayer } from '../entities/quiz-player.entity';
import { CreateQuizDto } from '../dto/quiz.dto';
import { KafkaService } from './kafka.service';
import { RedisService } from './redis.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(QuizPlayer)
    private quizPlayerRepository: Repository<QuizPlayer>,
    private kafkaService: KafkaService,
    private redisService: RedisService,
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
    // Return a demo quiz with fresh IDs each time
    const quizId = uuidv4(); // Generate new quiz ID each time
    
    // All available demo questions
    let allQuestions = [
      {
        id: uuidv4(),
        content: "Thủ đô của Việt Nam là gì?",
        options: ["A) Hà Nội", "B) TP.HCM", "C) Đà Nẵng", "D) Huế"],
        correctAnswer: 0, // Index của "A) Hà Nội"
        order: 1,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "2 + 2 = ?",
        options: ["A) 4", "B) 5", "C) 6", "D) 3"],
        correctAnswer: 0, // Index của "A) 4"
        order: 2,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "Ngôn ngữ lập trình nào được sử dụng để tạo React?",
        options: ["A) JavaScript", "B) Python", "C) Java", "D) C++"],
        correctAnswer: 0, // Index của "A) JavaScript"
        order: 3,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "HTTP viết tắt của gì?",
        options: ["A) HyperText Transfer Protocol", "B) Home Tool Transfer Protocol", "C) Hyperlink Text Protocol", "D) High Transfer Protocol"],
        correctAnswer: 0, // Index của "A) HyperText Transfer Protocol"
        order: 4,
        quizId: quizId
      },
      {
        id: uuidv4(),
        content: "Microservices là gì?",
        options: ["A) Kiến trúc phần mềm chia ứng dụng thành các service nhỏ", "B) Loại database", "C) Ngôn ngữ lập trình", "D) Framework frontend"],
        correctAnswer: 0, // Index của "A) Kiến trúc phần mềm chia ứng dụng thành các service nhỏ"
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
      title: `Demo Quiz - ${randomize ? 'Random' : 'Standard'} (${questions.length} câu)`,
      code: `DEMO${Date.now().toString().slice(-4)}`, // Dynamic code
      hostId: 'demo-host-123',
      createdAt: new Date().toISOString(),
      questions: questions
    };

    return demoQuiz;
  }

  // Utility function to shuffle array
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
    
    // Create quiz
    const quiz = this.quizRepository.create({
      id: uuidv4(),
      hostId,
      code,
      title: createQuizDto.title,
    });
    
    const savedQuiz = await this.quizRepository.save(quiz);

    // Create questions
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

    // Set quiz as started in Redis
    await this.redisService.setJson(`quiz:${quizId}:state`, {
      status: 'started',
      currentQuestionIndex: 0,
      startedAt: new Date(),
    });

    // Publish quiz started event
    await this.kafkaService.publish('quiz.started', { quizId });

    // Start with first question
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
      // Quiz ended
      await this.endQuiz(quizId);
      return;
    }

    const currentQuestion = questions[currentIndex];
    const deadline = new Date(Date.now() + 30000); // 30 seconds

    // Update quiz state
    await this.redisService.setJson(`quiz:${quizId}:state`, {
      ...quizState,
      currentQuestionIndex: currentIndex,
      currentQuestionId: currentQuestion.id,
      questionDeadline: deadline,
    });

    // Publish question presented event
    await this.kafkaService.publish('question.presented', {
      quizId,
      questionId: currentQuestion.id,
      content: currentQuestion.content,
      options: currentQuestion.options,
      deadline,
    });

    // Schedule time up event
    setTimeout(() => {
      this.timeUp(quizId, currentQuestion.id);
    }, 30000);
  }

  async nextQuestion(quizId: string): Promise<void> {
    const quizState = await this.redisService.getJson<any>(`quiz:${quizId}:state`);
    if (!quizState) {
      throw new Error('Quiz not started');
    }

    // Move to next question
    quizState.currentQuestionIndex += 1;
    await this.redisService.setJson(`quiz:${quizId}:state`, quizState);

    await this.presentNextQuestion(quizId);
  }

  private async timeUp(quizId: string, questionId: string): Promise<void> {
    await this.kafkaService.publish('time.up', { quizId, questionId });
  }

  private async endQuiz(quizId: string): Promise<void> {
    // Get final scores
    const players = await this.quizPlayerRepository.find({
      where: { quizId },
    });

    const result = players.map(player => ({
      playerId: player.playerId,
      score: player.score,
    }));

    // Update quiz state
    await this.redisService.setJson(`quiz:${quizId}:state`, {
      status: 'ended',
      endedAt: new Date(),
    });

    // Publish quiz ended event
    await this.kafkaService.publish('quiz.ended', { quizId, result });
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
}
