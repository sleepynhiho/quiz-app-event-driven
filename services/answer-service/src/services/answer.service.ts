import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../entities/answer.entity';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { AnswerSubmittedDto } from '../dto/answer-submitted.dto';
import { KafkaService } from './kafka.service';

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

    // Check if player already answered this question
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

    // TODO: Validate if quiz is active and question is current
    // TODO: Validate if submission is within time limit
    // For now, we'll assume these validations are done

    // Get correct answer from Quiz Service (simplified for now)
    const isCorrect = await this.validateAnswer(questionId, answer);

    // Save answer to database
    const newAnswer = this.answerRepository.create({
      playerId,
      quizId,
      questionId,
      answer,
      isCorrect,
      submittedAt: new Date(),
    });

    const savedAnswer = await this.answerRepository.save(newAnswer);

    // Publish answer.submitted event to Kafka
    const answerSubmittedEvent: AnswerSubmittedDto = {
      playerId,
      quizId,
      questionId,
      isCorrect,
      submittedAt: savedAnswer.submittedAt.toISOString(),
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

  // TODO: This should call Quiz Service to get the correct answer
  private async validateAnswer(questionId: string, answer: string): Promise<boolean> {
    // Simplified validation - in real implementation, this should:
    // 1. Call Quiz Service API to get question details
    // 2. Compare submitted answer with correct answer
    // 3. Handle different question types (multiple choice, text, etc.)
    
    // For now, return a mock validation
    this.logger.warn('Using mock answer validation - implement Quiz Service integration');
    
    // Mock: assume answers starting with 'A' or 'a' are correct
    return answer.toLowerCase().startsWith('a');
  }
} 