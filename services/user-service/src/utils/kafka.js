import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
};

export const disconnectProducer = async () => {
  await producer.disconnect();
};

export const publishMessage = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
    console.log(`Message published to topic ${topic}:`, message);
  } catch (error) {
    console.error('Error publishing message to Kafka:', error);
    throw error;
  }
};

export const publishPlayerJoined = async (playerId, quizId) => {
  const message = {
    playerId,
    quizId,
  };
  await publishMessage('player.joined', message);
}; 