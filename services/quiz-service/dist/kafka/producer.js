"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafkaProducer = void 0;
const kafkajs_1 = require("kafkajs");
class KafkaProducer {
    constructor() {
        this.isConnected = false;
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'quiz-service',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        });
        this.producer = this.kafka.producer();
    }
    async connect() {
        if (!this.isConnected) {
            await this.producer.connect();
            this.isConnected = true;
            console.log('Kafka producer connected');
        }
    }
    async publishQuizCreated(event) {
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
        }
        catch (error) {
            console.error('Error publishing quiz created event:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.producer.disconnect();
            this.isConnected = false;
            console.log('Kafka producer disconnected');
        }
    }
}
exports.kafkaProducer = new KafkaProducer();
//# sourceMappingURL=producer.js.map