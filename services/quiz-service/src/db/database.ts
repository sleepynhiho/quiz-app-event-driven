import { Pool, PoolClient } from 'pg';
import { Quiz, Question } from '../types';

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'quiz_app',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    console.log("Password:", process.env.DB_PASSWORD);
    console.log("user:", process.env.DB_USER);
  }


  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async createQuiz(quiz: Quiz): Promise<Quiz> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      // Insert quiz
      const quizResult = await client.query(
        `INSERT INTO quizzes (id, title, code, host_id, created_at) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [quiz.id, quiz.title, quiz.code, quiz.hostId, new Date()]
      );

      const createdQuiz = quizResult.rows[0];

      // Insert questions
      const questions: Question[] = [];
      if (quiz.questions) {
        for (const question of quiz.questions) {
          const questionResult = await client.query(
            `INSERT INTO questions (id, content, options, correct_answer, quiz_id) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [question.id, question.content, JSON.stringify(question.options), question.correctAnswer, quiz.id]
          );
          questions.push({
            id: questionResult.rows[0].id,
            content: questionResult.rows[0].content,
            options: questionResult.rows[0].options,
            correctAnswer: questionResult.rows[0].correct_answer,
            quizId: questionResult.rows[0].quiz_id
          });
        }
      }

      await client.query('COMMIT');

      return {
        id: createdQuiz.id,
        title: createdQuiz.title,
        code: createdQuiz.code,
        hostId: createdQuiz.host_id,
        createdAt: createdQuiz.created_at,
        questions
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async initSchema(): Promise<void> {
    const client = await this.getClient();
    try {
      // Create quizzes table
      await client.query(`
        CREATE TABLE IF NOT EXISTS quizzes (
          id UUID PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          code VARCHAR(6) UNIQUE NOT NULL,
          host_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create questions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id UUID PRIMARY KEY,
          content TEXT NOT NULL,
          options JSONB NOT NULL,
          correct_answer INTEGER NOT NULL,
          quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_quizzes_code ON quizzes(code);
        CREATE INDEX IF NOT EXISTS idx_quizzes_host_id ON quizzes(host_id);
        CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
      `);

      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Error initializing database schema:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async insertQuizPlayer(quizId: string, playerId: string): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query(
        `INSERT INTO quiz_players (quiz_id, player_id, score, joined_at) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (quiz_id, player_id) DO NOTHING`,
        [quizId, playerId, 0, new Date()]
      );
      console.log(`Player ${playerId} added to quiz ${quizId}`);
    } catch (error) {
      console.error('Error inserting quiz player:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const database = new Database();

// Export convenience function
export const insertQuizPlayer = (quizId: string, playerId: string) => 
  database.insertQuizPlayer(quizId, playerId);
