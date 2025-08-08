const { Kafka } = require('kafkajs');

async function testAnswerSubmission() {
  const kafka = new Kafka({
    clientId: 'test-producer',
    brokers: ['localhost:9092'],
  });

  const producer = kafka.producer();

  try {
    await producer.connect();
    console.log('Connected to Kafka');

    const testMessage = {
      playerId: 'test-player-123',
      quizId: 'test-quiz-456', 
      questionId: 'test-question-789',
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    };

    await producer.send({
      topic: 'answer.submitted',
      messages: [
        {
          value: JSON.stringify(testMessage),
        },
      ],
    });

    console.log('Test message sent:', testMessage);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await producer.disconnect();
  }
}

testAnswerSubmission();
