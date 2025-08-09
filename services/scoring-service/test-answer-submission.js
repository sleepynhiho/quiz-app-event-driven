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

    const now = new Date();
    const deadline = new Date(now.getTime() + 20000); // 20 seconds from now
    
    const testMessage = {
      playerId: '550e8400-e29b-41d4-a716-446655440001',
      quizId: '550e8400-e29b-41d4-a716-446655440002', 
      questionId: '550e8400-e29b-41d4-a716-446655440003',
      isCorrect: true,
      submittedAt: now.toISOString(),
      deadline: deadline.toISOString(),
      questionWeight: 2, // Optional field for testing
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
