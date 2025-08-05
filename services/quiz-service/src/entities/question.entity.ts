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

  @Column()
  correctAnswer: string;

  @Column('integer')
  order: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;
}
