import { Kafka } from 'kafkajs';

export async function testKafkaConnection(): Promise<boolean> {
  console.log('🔍 Testing Kafka Connection...\n');
  
  const kafka = new Kafka({
    clientId: 'kafka-health-check',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });

  const admin = kafka.admin();

  try {
    // Connect to Kafka
    await admin.connect();
    console.log('✅ Connected to Kafka successfully');

    // List topics
    const topics = await admin.listTopics();
    console.log('📋 Available topics:', topics);

    // Check if our required topic exists
    const hasAnswerTopic = topics.includes('answer.submitted');
    console.log(`📝 answer.submitted topic exists: ${hasAnswerTopic ? '✅ Yes' : '❌ No'}`);

    if (!hasAnswerTopic) {
      console.log('⚠️  Creating answer.submitted topic...');
      await admin.createTopics({
        topics: [
          {
            topic: 'answer.submitted',
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
      console.log('✅ Topic created successfully');
    }

    // Test producer
    const producer = kafka.producer();
    await producer.connect();
    console.log('✅ Producer connected');

    // Test consumer
    const consumer = kafka.consumer({ groupId: 'health-check-group' });
    await consumer.connect();
    console.log('✅ Consumer connected');

    await producer.disconnect();
    await consumer.disconnect();

  } catch (error) {
    console.error('❌ Kafka connection failed:', error instanceof Error ? error.message : String(error));
    return false;
  } finally {
    await admin.disconnect();
  }

  console.log('\n🎉 Kafka is healthy and ready!\n');
  return true;
}

// Run if this is the main module
if (require.main === module) {
  testKafkaConnection()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
