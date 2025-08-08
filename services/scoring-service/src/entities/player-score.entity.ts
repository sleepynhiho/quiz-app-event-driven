import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('player_scores')
@Index(['playerId', 'quizId'], { unique: true })
export class PlayerScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'total_score', type: 'integer', default: 0 })
  totalScore: number;

  @Column({ name: 'correct_answers', type: 'integer', default: 0 })
  correctAnswers: number;

  @Column({ name: 'total_answers', type: 'integer', default: 0 })
  totalAnswers: number;

  @Column({ name: 'last_answered_at', type: 'timestamp', nullable: true })
  lastAnsweredAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
