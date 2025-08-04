import { Quiz, Question, CreateQuizRequest, CreateQuizResponse, KafkaQuizCreatedEvent } from '../types';
import { database } from '../db/database';
import { kafkaProducer } from '../kafka/producer';
import { generateUUID, generateQuizCode } from '../utils/helpers';

export class QuizService {
  async createQuiz(quizData: CreateQuizRequest, hostId: string): Promise<CreateQuizResponse> {
    try {
      // Generate unique IDs
      const quizId = generateUUID();
      const quizCode = generateQuizCode();

      // Prepare questions with UUIDs
      const questions: Question[] = quizData.questions.map(q => ({
        id: generateUUID(),
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        quizId: quizId
      }));

      // Prepare quiz object
      const quiz: Quiz = {
        id: quizId,
        title: quizData.title,
        code: quizCode,
        hostId: hostId,
        questions: questions
      };

      // Save to database
      const createdQuiz = await database.createQuiz(quiz);

      // Publish Kafka event
      const kafkaEvent: KafkaQuizCreatedEvent = {
        quizId: createdQuiz.id!,
        title: createdQuiz.title,
        hostId: createdQuiz.hostId
      };

      await kafkaProducer.publishQuizCreated(kafkaEvent);

      // Return response
      return {
        quizId: createdQuiz.id!,
        code: createdQuiz.code!,
        title: createdQuiz.title,
        questions: createdQuiz.questions || []
      };

    } catch (error) {
      console.error('Error creating quiz:', error);
      throw new Error('Failed to create quiz');
    }
  }
}
