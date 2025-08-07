declare class KafkaConsumer {
    private kafka;
    private consumer;
    private isConnected;
    constructor();
    connect(): Promise<void>;
    subscribe(): Promise<void>;
    startConsuming(): Promise<void>;
    private handlePlayerJoined;
    disconnect(): Promise<void>;
    stop(): Promise<void>;
}
export declare const kafkaConsumer: KafkaConsumer;
export {};
//# sourceMappingURL=consumer.d.ts.map