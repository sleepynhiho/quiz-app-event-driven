import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizController } from './controllers/quiz.controller';
import { QuizService } from './services/quiz.service';
import { KafkaService } from './services/kafka.service';
import { RedisService } from './services/redis.service';
import { QuizGateway } from './gateways/quiz.gateway';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { QuizPlayer } from './entities/quiz-player.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'quiz_app',
      entities: [Quiz, Question, QuizPlayer],
      synchronize: false, // Disable auto sync to avoid schema conflicts
    }),
    TypeOrmModule.forFeature([Quiz, Question, QuizPlayer]),
  ],
  controllers: [AppController, QuizController],
  providers: [AppService, QuizService, KafkaService, RedisService, QuizGateway],
})
export class AppModule {}
