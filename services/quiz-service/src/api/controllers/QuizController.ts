import { Request, Response } from 'express';
import { QuizService } from '../../services/QuizService';
import { validateCreateQuiz } from '../../utils/validation';
import { createErrorResponse, createSuccessResponse } from '../../utils/helpers';
import { CreateQuizRequest } from '../../types';

export class QuizController {
  private quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  createQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json(createErrorResponse('User not authenticated', 'UNAUTHORIZED'));
        return;
      }

      // Validate request body
      const { error, value } = validateCreateQuiz(req.body);
      
      if (error) {
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        
        res.status(400).json(createErrorResponse(
          'Validation failed', 
          'VALIDATION_ERROR', 
          errorDetails
        ));
        return;
      }

      const quizData: CreateQuizRequest = value;
      const hostId = req.user.id;

      // Create quiz
      const result = await this.quizService.createQuiz(quizData, hostId);

      // Return success response
      res.status(201).json(createSuccessResponse(
        result,
        'Quiz created successfully'
      ));

    } catch (error) {
      console.error('Error in createQuiz controller:', error);
      
      if (error instanceof Error) {
        res.status(500).json(createErrorResponse(
          error.message,
          'INTERNAL_SERVER_ERROR'
        ));
      } else {
        res.status(500).json(createErrorResponse(
          'An unexpected error occurred',
          'INTERNAL_SERVER_ERROR'
        ));
      }
    }
  };
}
