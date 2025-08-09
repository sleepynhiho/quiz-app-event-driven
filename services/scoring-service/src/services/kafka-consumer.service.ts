import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { ScoringService } from './scoring.service';
import { AnswerSubmittedDto } from '../dto/answer-submitted.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly scoringService: ScoringService,
  ) {}

  async onModuleInit() {
    await this.subscribeToTopics();
  }

  private async subscribeToTopics() {
    try {
      const consumer = this.kafkaService.getConsumer();
      
      // Subscribe to the answer.submitted topic
      await consumer.subscribe({ 
        topics: ['answer.submitted'],
        fromBeginning: false 
      });

      this.logger.log('Subscribed to Kafka topics: answer.submitted');

      // Start consuming messages
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value?.toString();
            if (value) {
              this.logger.log(`Received message from topic ${topic}: ${value}`);
              await this.handleMessage(topic, JSON.parse(value));
            }
          } catch (error) {
            this.logger.error(`Error processing message from topic ${topic}:`, error);
          }
        },
      });

      this.logger.log('Kafka consumer is running');
    } catch (error) {
      this.logger.error('Error setting up Kafka consumer:', error);
      throw error;
    }
  }

  private async handleMessage(topic: string, data: any) {
    switch (topic) {
      case 'answer.submitted':
        await this.handleAnswerSubmitted(data);
        break;
      default:
        this.logger.warn(`Unhandled topic: ${topic}`);
    }
  }

  private async handleAnswerSubmitted(data: any) {
    try {
      // Validate the incoming data
      const answerDto = plainToClass(AnswerSubmittedDto, data);
      const errors = await validate(answerDto);

      if (errors.length > 0) {
        this.logger.error('Invalid answer submitted data:', errors);
        return;
      }

      // Process the answer
      await this.scoringService.processAnswerSubmitted(answerDto);
      
      this.logger.log(`Successfully processed answer submission for player ${answerDto.playerId}`);
    } catch (error) {
      this.logger.error('Error handling answer submitted event:', error);
    }
  }
}
