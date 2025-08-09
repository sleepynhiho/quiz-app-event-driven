const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Test query
    const result = await client.query('SELECT current_database(), current_user, version();');
    console.log('\n📊 Database Info:');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    console.log('Version:', result.rows[0].version.split(' ').slice(0, 2).join(' '));
    
    // Check if our table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'player_scores'
      );
    `);
    
    console.log('\n📋 Schema Check:');
    console.log('player_scores table exists:', tableCheck.rows[0].exists ? '✅ Yes' : '❌ No');

  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure Docker is running');
      console.log('2. Check if PostgreSQL container is up:');
      console.log('   docker ps | findstr postgres');
      console.log('3. Verify port mapping:');
      console.log('   docker-compose ps postgres');
    }
  } finally {
    await client.end();
  }
}

testConnection();
