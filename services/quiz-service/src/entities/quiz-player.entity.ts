import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('quiz_players')
export class QuizPlayer {
  @PrimaryColumn('uuid', { name: 'quiz_id' })
  quizId: string;

  @PrimaryColumn('uuid', { name: 'player_id' })
  playerId: string;

  @Column('integer', { default: 0 })
  score: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;
}
