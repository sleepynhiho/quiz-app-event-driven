#!/usr/bin/env node

import { testKafkaConnection } from './test-kafka-connection';
import { testDatabaseConnection } from './test-db-connection';

async function runHealthChecks(): Promise<boolean> {
  console.log('🏥 Running Health Checks for Scoring Service\n');
  console.log('='.repeat(50));

  let allHealthy = true;

  // Test Kafka
  try {
    const kafkaHealthy = await testKafkaConnection();
    if (!kafkaHealthy) allHealthy = false;
  } catch (error) {
    console.error('❌ Kafka health check failed:', error instanceof Error ? error.message : String(error));
    allHealthy = false;
  }

  console.log('-'.repeat(50));

  // Test Database
  try {
    const dbHealthy = await testDatabaseConnection();
    if (!dbHealthy) allHealthy = false;
  } catch (error) {
    console.error('❌ Database health check failed:', error instanceof Error ? error.message : String(error));
    allHealthy = false;
  }

  console.log('='.repeat(50));

  if (allHealthy) {
    console.log('🎉 All systems are healthy! Ready to start scoring service.');
    console.log('\nNext steps:');
    console.log('1. cd services/scoring-service');
    console.log('2. npm run start:dev');
  } else {
    console.log('⚠️  Some systems are not healthy. Please fix the issues above.');
  }

  return allHealthy;
}

// Run if this is the main module
if (require.main === module) {
  runHealthChecks()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

export { runHealthChecks };
