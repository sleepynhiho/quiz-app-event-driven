const { Kafka } = require('kafkajs');

async function testEnhancedScoring() {
  const kafka = new Kafka({
    clientId: 'enhanced-scoring-test',
    brokers: ['localhost:9092'],
  });

  const producer = kafka.producer();

  try {
    await producer.connect();
    console.log('🔌 Connected to Kafka for enhanced scoring tests');

    const baseTime = new Date();
    const deadline = new Date(baseTime.getTime() + 30000); // 30 seconds from start
    const quizId = '550e8400-e29b-41d4-a716-446655440010';
    const questionId = '550e8400-e29b-41d4-a716-446655440020';

    console.log(`\n🧪 Testing Enhanced Scoring Logic`);
    console.log(`Quiz ID: ${quizId}`);
    console.log(`Question ID: ${questionId}`);
    console.log(`Deadline: ${deadline.toISOString()}\n`);

    // Test 1: First correct answer (should get order bonus)
    const player1SubmitTime = new Date(baseTime.getTime() + 5000); // 5 seconds after start
    const testMessage1 = {
      playerId: '550e8400-e29b-41d4-a716-446655440001',
      quizId: quizId,
      questionId: questionId,
      isCorrect: true,
      submittedAt: player1SubmitTime.toISOString(),
      deadline: deadline.toISOString(),
      questionWeight: 2, // Higher weight for testing
    };

    await producer.send({
      topic: 'answer.submitted',
      messages: [{ value: JSON.stringify(testMessage1) }],
    });

    console.log('✅ Test 1 sent - First correct answer (Player 1):');
    console.log(`   Expected: Base(200) + Time(~41) + Order(20) = ~261 points`);

    // Wait a bit between messages
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Second correct answer (should get smaller order bonus)
    const player2SubmitTime = new Date(baseTime.getTime() + 10000); // 10 seconds after start
    const testMessage2 = {
      playerId: '550e8400-e29b-41d4-a716-446655440002',
      quizId: quizId,
      questionId: questionId,
      isCorrect: true,
      submittedAt: player2SubmitTime.toISOString(),
      deadline: deadline.toISOString(),
      questionWeight: 2,
    };

    await producer.send({
      topic: 'answer.submitted',
      messages: [{ value: JSON.stringify(testMessage2) }],
    });

    console.log('✅ Test 2 sent - Second correct answer (Player 2):');
    console.log(`   Expected: Base(200) + Time(~33) + Order(10) = ~243 points`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Third correct answer (no order bonus)
    const player3SubmitTime = new Date(baseTime.getTime() + 15000); // 15 seconds after start
    const testMessage3 = {
      playerId: '550e8400-e29b-41d4-a716-446655440003',
      quizId: quizId,
      questionId: questionId,
      isCorrect: true,
      submittedAt: player3SubmitTime.toISOString(),
      deadline: deadline.toISOString(),
      questionWeight: 2,
    };

    await producer.send({
      topic: 'answer.submitted',
      messages: [{ value: JSON.stringify(testMessage3) }],
    });

    console.log('✅ Test 3 sent - Third correct answer (Player 3):');
    console.log(`   Expected: Base(200) + Time(~25) + Order(0) = ~225 points`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 4: Incorrect answer (should get 0 points)
    const testMessage4 = {
      playerId: '550e8400-e29b-41d4-a716-446655440004',
      quizId: quizId,
      questionId: questionId,
      isCorrect: false,
      submittedAt: new Date(baseTime.getTime() + 8000).toISOString(),
      deadline: deadline.toISOString(),
      questionWeight: 2,
    };

    await producer.send({
      topic: 'answer.submitted',
      messages: [{ value: JSON.stringify(testMessage4) }],
    });

    console.log('✅ Test 4 sent - Incorrect answer (Player 4):');
    console.log(`   Expected: 0 points (incorrect answer)`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 5: Default question weight (should use 1)
    const testMessage5 = {
      playerId: '550e8400-e29b-41d4-a716-446655440005',
      quizId: quizId,
      questionId: '550e8400-e29b-41d4-a716-446655440021', // Different question
      isCorrect: true,
      submittedAt: new Date(baseTime.getTime() + 5000).toISOString(),
      deadline: new Date(baseTime.getTime() + 30000).toISOString(),
      // No questionWeight - should default to 1
    };

    await producer.send({
      topic: 'answer.submitted',
      messages: [{ value: JSON.stringify(testMessage5) }],
    });

    console.log('✅ Test 5 sent - Default weight question (Player 5):');
    console.log(`   Expected: Base(100) + Time(~41) + Order(20) = ~161 points`);

    console.log('\n🎯 All test messages sent! Check the scoring service logs and database.');
    console.log('💡 Use: docker exec quiz-postgres psql -U postgres -d quiz_app -c "SELECT * FROM player_scores;"');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await producer.disconnect();
    console.log('🔌 Disconnected from Kafka');
  }
}

testEnhancedScoring();
