import { KafkaQuizCreatedEvent } from '../types';
declare class KafkaProducer {
    private kafka;
    private producer;
    private isConnected;
    constructor();
    connect(): Promise<void>;
    publishQuizCreated(event: KafkaQuizCreatedEvent): Promise<void>;
    disconnect(): Promise<void>;
}
export declare const kafkaProducer: KafkaProducer;
export {};
//# sourceMappingURL=producer.d.ts.map