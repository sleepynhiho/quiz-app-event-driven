import { Kafka, Producer } from 'kafkajs';
import { KafkaQuizCreatedEvent } from '../types';

class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'quiz-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
      console.log('Kafka producer connected');
    }
  }

  async publishQuizCreated(event: KafkaQuizCreatedEvent): Promise<void> {
    try {
      await this.connect();
      
      await this.producer.send({
        topic: 'quiz.created',
        messages: [
          {
            key: event.quizId,
            value: JSON.stringify(event),
            timestamp: Date.now().toString(),
          },
        ],
      });

      console.log('Quiz created event published:', event);
    } catch (error) {
      console.error('Error publishing quiz created event:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('Kafka producer disconnected');
    }
  }
}

export const kafkaProducer = new KafkaProducer();
