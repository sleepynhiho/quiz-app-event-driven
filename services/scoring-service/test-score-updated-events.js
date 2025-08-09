const { Kafka } = require('kafkajs');

async function testScoreUpdatedEvents() {
  const kafka = new Kafka({
    clientId: 'score-updated-test-consumer',
    brokers: ['localhost:9092'],
  });

  const consumer = kafka.consumer({ groupId: 'score-updated-test-group' });

  try {
    await consumer.connect();
    console.log('🔌 Connected to Kafka as consumer');

    // Subscribe to score.updated topic
    await consumer.subscribe({ topic: 'score.updated', fromBeginning: true });
    console.log('📡 Subscribed to score.updated topic');

    console.log('🎧 Listening for score.updated events...');
    console.log('💡 Send some test answers to generate score updates\n');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const scoreUpdate = JSON.parse(message.value.toString());
          const timestamp = new Date(parseInt(message.timestamp)).toISOString();
          
          console.log(`\n📊 Score Updated Event Received:`);
          console.log(`   Topic: ${topic}`);
          console.log(`   Partition: ${partition}`);
          console.log(`   Timestamp: ${timestamp}`);
          console.log(`   Payload:`, JSON.stringify(scoreUpdate, null, 4));
          
          // Validate payload structure
          const { playerId, quizId, score } = scoreUpdate;
          
          if (!playerId || !quizId || typeof score !== 'number') {
            console.log('   ⚠️  Warning: Payload structure validation failed');
          } else {
            console.log(`   ✅ Valid payload: Player ${playerId} has ${score} points in quiz ${quizId}`);
          }
          
        } catch (error) {
          console.error('   ❌ Error parsing message:', error.message);
        }
      },
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down score.updated event listener...');
  process.exit(0);
});

console.log('🧪 Starting Score Updated Events Test');
console.log('Press Ctrl+C to stop\n');

testScoreUpdatedEvents();
