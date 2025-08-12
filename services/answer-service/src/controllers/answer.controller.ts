import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnswerService } from '../services/answer.service';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { Answer } from '../entities/answer.entity';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  async submitAnswer(
    @Body(ValidationPipe) submitAnswerDto: SubmitAnswerDto,
  ): Promise<Answer> {
    return this.answerService.submitAnswer(submitAnswerDto);
  }

  @Get('player/:playerId/quiz/:quizId')
  async getPlayerAnswers(
    @Param('playerId') playerId: string,
    @Param('quizId') quizId: string,
  ): Promise<Answer[]> {
    return this.answerService.getPlayerAnswers(playerId, quizId);
  }

  @Get('question/:questionId')
  async getQuestionAnswers(
    @Param('questionId') questionId: string,
  ): Promise<Answer[]> {
    return this.answerService.getQuestionAnswers(questionId);
  }
}
