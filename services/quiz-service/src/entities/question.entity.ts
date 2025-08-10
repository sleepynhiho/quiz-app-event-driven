import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'quiz_id' })
  quizId: string;

  @Column('text')
  content: string;

  @Column('jsonb')
  options: string[];

  @Column('integer', { name: 'correct_answer' })
  correctAnswer: number;

  @Column('integer', { default: 1 })
  order: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;
}
