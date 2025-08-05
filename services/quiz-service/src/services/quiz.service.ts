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
