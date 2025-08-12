import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../entities/answer.entity';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { AnswerSubmittedDto } from '../dto/answer-submitted.dto';
import { KafkaService } from './kafka.service';
import axios from 'axios';

@Injectable()
export class AnswerService {
  private readonly logger = new Logger(AnswerService.name);

  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    private kafkaService: KafkaService,
  ) {}

  async submitAnswer(submitAnswerDto: SubmitAnswerDto): Promise<Answer> {
    const { playerId, quizId, questionId, answer } = submitAnswerDto;

    // Prevent duplicate answers
    const existingAnswer = await this.answerRepository.findOne({
      where: {
        playerId,
        quizId,
        questionId,
      },
    });

    if (existingAnswer) {
      throw new BadRequestException('Player has already answered this question');
    }

    // Validate quiz state and current question
    const quizState = await this.validateQuizState(quizId, questionId);
    
    // Check submission deadline
    await this.validateSubmissionTime(quizId, questionId);

    // Validate answer correctness
    const isCorrect = await this.validateAnswer(questionId, answer);

    // Store answer in database
    const newAnswer = this.answerRepository.create({
      playerId,
      quizId,
      questionId,
      answer,
      isCorrect,
      submittedAt: new Date(),
    });

    const savedAnswer = await this.answerRepository.save(newAnswer);

    // Publish to Kafka for scoring
    const answerSubmittedEvent: AnswerSubmittedDto = {
      playerId,
      quizId,
      questionId,
      isCorrect,
      submittedAt: savedAnswer.submittedAt.toISOString(),
      deadline: quizState?.questionDeadline || new Date(Date.now() + 30000).toISOString(),
    };

    await this.kafkaService.publishMessage('answer.submitted', answerSubmittedEvent);

    this.logger.log(`Answer submitted by player ${playerId} for question ${questionId}`);

    return savedAnswer;
  }

  async getPlayerAnswers(playerId: string, quizId: string): Promise<Answer[]> {
    return this.answerRepository.find({
      where: {
        playerId,
        quizId,
      },
      order: {
        submittedAt: 'ASC',
      },
    });
  }

  async getQuestionAnswers(questionId: string): Promise<Answer[]> {
    return this.answerRepository.find({
      where: {
        questionId,
      },
      order: {
        submittedAt: 'ASC',
      },
    });
  }

  private async validateQuizState(quizId: string, questionId: string): Promise<any> {
    try {
      const quizServiceUrl = process.env.QUIZ_SERVICE_URL || 'http://localhost:3001';
      const response = await axios.get(`${quizServiceUrl}/api/quiz/${quizId}/state`);
      
      const result = response.data;
      const quizState = result.data || result;
      
      if (quizState.status !== 'started' && quizState.status !== 'active') {
        throw new BadRequestException('Quiz is not active');
      }
      
      if (quizState.currentQuestionId !== questionId) {
        throw new BadRequestException('Question is not currently active');
      }

      return quizState;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.response?.status === 404) {
        throw new BadRequestException('Quiz not found or not active');
      }
      this.logger.warn(`Failed to validate quiz state: ${error.message}`);
      return null;
    }
  }

  private async validateSubmissionTime(quizId: string, questionId: string): Promise<void> {
    try {
      const quizServiceUrl = process.env.QUIZ_SERVICE_URL || 'http://localhost:3001';
      const response = await axios.get(`${quizServiceUrl}/api/quiz/${quizId}/state`);
      
      if (response.status === 200) {
        const result = response.data;
        const quizState = result.data || result;
        
        if (quizState.questionDeadline) {
          const deadline = new Date(quizState.questionDeadline);
          const now = new Date();
          
          if (now > deadline) {
            throw new BadRequestException('Submission time has expired');
          }
        }
      }
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.warn(`Failed to validate submission time: ${error.message}`);
    }
  }

  private async validateAnswer(questionId: string, answer: string): Promise<boolean> {
    try {
      // Get question from Quiz Service
      const quizServiceUrl = process.env.QUIZ_SERVICE_URL || 'http://localhost:3001';
      const response = await axios.get(`${quizServiceUrl}/api/quiz/question/${questionId}`);
      
      const questionResponse = response.data;
      const question = questionResponse.data || questionResponse;
      
      // Convert letter to index (A=0, B=1, C=2, D=3)
      const answerIndex = answer.toUpperCase().charCodeAt(0) - 65;
      
      // Check correctness
      return answerIndex === question.correctAnswer;
    } catch (error: any) {
      this.logger.error(`Error validating answer for question ${questionId}:`, error.message || error);
      // Fallback validation
      return answer.toLowerCase().startsWith('a');
    }
  }
} 