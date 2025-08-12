import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @Column()
  answer: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect: boolean;
}
