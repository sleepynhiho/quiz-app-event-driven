import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QuizService } from '../services/quiz.service';
import { CreateQuizDto } from '../dto/quiz.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  async getAllQuizzes(@Query('hostId') hostId?: string) {
    try {
      const quizzes = await this.quizService.getAllQuizzes(hostId);
      return {
        success: true,
        data: quizzes,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get quizzes',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('demo')
  async getDemoQuiz(
    @Query('limit') limit?: string,
    @Query('random') random?: string,
  ) {
    try {
      const questionLimit = limit ? parseInt(limit) : undefined;
      const randomize = random === 'true';
      
      const demoQuiz = await this.quizService.getDemoQuiz(questionLimit, randomize);
      return demoQuiz;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get demo quiz',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getQuiz(@Param('id') quizId: string) {
    try {
      const quiz = await this.quizService.getQuizWithQuestions(quizId);
      return quiz;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get quiz',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('create')
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    try {
      // For now, using a hardcoded hostId. In production, this would come from JWT token
      const hostId = '123e4567-e89b-12d3-a456-426614174000';
      const quiz = await this.quizService.createQuiz(hostId, createQuizDto);
      
      return {
        success: true,
        data: quiz,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create quiz',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/start')
  async startQuiz(@Param('id') quizId: string) {
    try {
      await this.quizService.startQuiz(quizId);
      
      return {
        success: true,
        message: 'Quiz started successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to start quiz',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/next')
  async nextQuestion(@Param('id') quizId: string) {
    try {
      await this.quizService.nextQuestion(quizId);
      
      return {
        success: true,
        message: 'Next question presented',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to present next question',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
