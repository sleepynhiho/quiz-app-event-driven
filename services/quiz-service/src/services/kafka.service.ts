import { Injectable, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { QuizGateway } from '../gateways/quiz.gateway';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(
    @Inject(forwardRef(() => QuizGateway))
    private quizGateway: QuizGateway,
  ) {
    this.kafka = new Kafka({
      clientId: 'quiz-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'quiz-service-group' });
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
    
    // Subscribe to topics that this service actually needs
    await this.consumer.subscribe({ topics: ['score.updated', 'player.joined'] });
    
    // Start consuming
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value?.toString();
        if (value) {
          const data = JSON.parse(value);
          await this.handleMessage(topic, data);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async publish(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  }

  private async handleMessage(topic: string, data: any) {
    switch (topic) {
      case 'player.joined':
        // Handle player joined - broadcast to quiz room
        console.log('Player joined:', data);
        this.quizGateway.broadcastToQuiz(data.quizId, 'player.joined', data);
        break;
      case 'score.updated':
        // Handle score updated - broadcast to quiz room
        console.log('Score updated:', data);
        this.quizGateway.broadcastToQuiz(data.quizId, 'score.updated', data);
        break;
      default:
        console.log('Unknown topic:', topic, data);
    }
  }
}
