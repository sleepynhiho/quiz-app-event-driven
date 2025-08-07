"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafkaConsumer = void 0;
const kafkajs_1 = require("kafkajs");
const playerJoinedHandler_1 = require("./handlers/playerJoinedHandler");
class KafkaConsumer {
    constructor() {
        this.isConnected = false;
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'quiz-service-consumer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        });
        this.consumer = this.kafka.consumer({ groupId: 'quiz-service-group' });
    }
    async connect() {
        if (!this.isConnected) {
            await this.consumer.connect();
            this.isConnected = true;
            console.log('Kafka consumer connected');
        }
    }
    async subscribe() {
        await this.connect();
        await this.consumer.subscribe({
            topic: 'player.joined',
            fromBeginning: false,
        });
        console.log('Subscribed to player.joined topic');
    }
    async startConsuming() {
        await this.subscribe();
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    if (!message.value) {
                        console.warn('Received empty message');
                        return;
                    }
                    const eventData = JSON.parse(message.value.toString());
                    console.log('Received player.joined event:', eventData);
                    await this.handlePlayerJoined(eventData);
                }
                catch (error) {
                    console.error('Error processing player.joined event:', error);
                    // In production, you might want to send to a dead letter queue
                }
            },
        });
    }
    async handlePlayerJoined(event) {
        try {
            await (0, playerJoinedHandler_1.handlePlayerJoinedEvent)(event);
            console.log(`Successfully added player ${event.playerId} to quiz ${event.quizId}`);
        }
        catch (error) {
            console.error('Error inserting quiz player:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.consumer.disconnect();
            this.isConnected = false;
            console.log('Kafka consumer disconnected');
        }
    }
    async stop() {
        await this.consumer.stop();
        console.log('Kafka consumer stopped');
    }
}
exports.kafkaConsumer = new KafkaConsumer();
//# sourceMappingURL=consumer.js.map