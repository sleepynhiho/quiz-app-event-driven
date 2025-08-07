#!/usr/bin/env node

/**
 * Test script to verify the Kafka consumer implementation
 * This script simulates a player.joined event to test the consumer
 */

const { Kafka } = require('kafkajs');

async function testPlayerJoinedEvent() {
  const kafka = new Kafka({
    clientId: 'test-client',
    brokers: ['localhost:9092'],
  });

  const producer = kafka.producer();

  try {
    await producer.connect();
    console.log('Connected to Kafka');

    const testEvent = {
      playerId: '550e8400-e29b-41d4-a716-446655440001',
      quizId: 'f2b56332-628f-417a-9dac-32483883a98c',
    };

    await producer.send({
      topic: 'player.joined',
      messages: [
        {
          value: JSON.stringify(testEvent),
        },
      ],
    });

    console.log('Test event sent:', testEvent);
    console.log('Check the quiz-service logs to see if the event was processed');

  } catch (error) {
    console.error('Error sending test event:', error);
  } finally {
    await producer.disconnect();
  }
}

testPlayerJoinedEvent();
