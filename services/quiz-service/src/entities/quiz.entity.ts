import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Question } from './question.entity';
import { QuizPlayer } from './quiz-player.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'host_id' })
  hostId: string;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions: Question[];

  @OneToMany(() => QuizPlayer, (quizPlayer) => quizPlayer.quiz, { cascade: true })
  players: QuizPlayer[];
}
