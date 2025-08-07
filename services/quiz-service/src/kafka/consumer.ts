import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaPlayerJoinedEvent } from '../types';
import { handlePlayerJoinedEvent } from './handlers/playerJoinedHandler';

class KafkaConsumer {
  private kafka: Kafka;
  private consumer: Consumer;
  private isConnected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'quiz-service-consumer',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'quiz-service-group' });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.consumer.connect();
      this.isConnected = true;
      console.log('Kafka consumer connected');
    }
  }

  async subscribe(): Promise<void> {
    await this.connect();
    
    await this.consumer.subscribe({
      topic: 'player.joined',
      fromBeginning: false,
    });

    console.log('Subscribed to player.joined topic');
  }

  async startConsuming(): Promise<void> {
    await this.subscribe();

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        try {
          if (!message.value) {
            console.warn('Received empty message');
            return;
          }

          const eventData: KafkaPlayerJoinedEvent = JSON.parse(message.value.toString());
          console.log('Received player.joined event:', eventData);

          await this.handlePlayerJoined(eventData);
        } catch (error) {
          console.error('Error processing player.joined event:', error);
          // In production, you might want to send to a dead letter queue
        }
      },
    });
  }

  private async handlePlayerJoined(event: KafkaPlayerJoinedEvent): Promise<void> {
    try {
      await handlePlayerJoinedEvent(event);
      console.log(`Successfully added player ${event.playerId} to quiz ${event.quizId}`);
    } catch (error) {
      console.error('Error inserting quiz player:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('Kafka consumer disconnected');
    }
  }

  async stop(): Promise<void> {
    await this.consumer.stop();
    console.log('Kafka consumer stopped');
  }
}

export const kafkaConsumer = new KafkaConsumer();
