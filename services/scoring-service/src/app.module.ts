import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScoringService } from './services/scoring.service';
import { KafkaService } from './services/kafka.service';
import { PlayerScore } from './entities/player-score.entity';
import { KafkaConsumerService } from './services/kafka-consumer.service';
import { ScoreController } from './controllers/score.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'quiz_app',
      entities: [PlayerScore],
      synchronize: true, // Only for development
    }),
    TypeOrmModule.forFeature([PlayerScore]),
  ],
  controllers: [AppController, ScoreController],
  providers: [AppService, ScoringService, KafkaService, KafkaConsumerService],
})
export class AppModule {}
