import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnswerController } from './controllers/answer.controller';
import { HealthController } from './controllers/health.controller';
import { AnswerService } from './services/answer.service';
import { KafkaService } from './services/kafka.service';
import { Answer } from './entities/answer.entity';

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
      entities: [Answer],
      synchronize: process.env.NODE_ENV !== 'production', // Don't use in production
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Answer]),
  ],
  controllers: [AppController, AnswerController, HealthController],
  providers: [AppService, AnswerService, KafkaService],
})
export class AppModule {}
