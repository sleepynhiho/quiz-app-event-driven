import { Kafka } from 'kafkajs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

async function testScoringFlow() {
  console.log('🧪 Testing Scoring Service Flow...\n');

  const kafka = new Kafka({
    clientId: 'scoring-test-producer',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });

  const producer = kafka.producer();

  try {
    await producer.connect();
    console.log('✅ Connected to Kafka');

    // Test 1: Correct answer (should add 10 points)
    const correctAnswer = {
      playerId: 'test-player-001',
      quizId: 'test-quiz-001',
      questionId: 'test-question-001',
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    };

    await producer.send({
      topic: 'answer.submitted',
      messages: [
        {
          key: correctAnswer.playerId,
          value: JSON.stringify(correctAnswer),
        },
      ],
    });

    console.log('📤 Sent correct answer message');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Incorrect answer (should add 0 points)
    const incorrectAnswer = {
      playerId: 'test-player-001',
      quizId: 'test-quiz-001',
      questionId: 'test-question-002',
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    };

    await producer.send({
      topic: 'answer.submitted',
      messages: [
        {
          key: incorrectAnswer.playerId,
          value: JSON.stringify(incorrectAnswer),
        },
      ],
    });

    console.log('📤 Sent incorrect answer message');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Another correct answer (should increment by 10)
    const anotherCorrectAnswer = {
      playerId: 'test-player-001',
      quizId: 'test-quiz-001',
      questionId: 'test-question-003',
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    };

    await producer.send({
      topic: 'answer.submitted',
      messages: [
        {
          key: anotherCorrectAnswer.playerId,
          value: JSON.stringify(anotherCorrectAnswer),
        },
      ],
    });

    console.log('📤 Sent another correct answer message');

    console.log('\n✅ Test messages sent successfully!');
    console.log('\n💡 Check the scoring service logs to see the processing results.');
    console.log('💡 Expected final score for test-player-001: 20 points (10 + 0 + 10)');
    console.log('\n🔍 You can check the score via API:');
    console.log('   GET http://localhost:3003/api/scores/player/test-player-001/quiz/test-quiz-001');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await producer.disconnect();
  }
}

if (require.main === module) {
  testScoringFlow()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { testScoringFlow };
