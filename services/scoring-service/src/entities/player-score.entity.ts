import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('player_scores')
@Index(['playerId', 'quizId'], { unique: true })
export class PlayerScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @Column({ name: 'score', type: 'integer', default: 0 })
  score: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
