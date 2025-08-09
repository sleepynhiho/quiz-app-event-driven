const { Pool } = require('pg');

async function testDatabaseConnection() {
  console.log('🔍 Testing PostgreSQL Connection...\n');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'quiz_app',
  });

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully');

    // Test database exists
    const dbResult = await client.query('SELECT current_database()');
    console.log(`🗃️  Connected to database: ${dbResult.rows[0].current_database}`);

    // Test if player_scores table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'player_scores'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log(`📊 player_scores table exists: ${tableExists ? '✅ Yes' : '❌ No'}`);

    if (!tableExists) {
      console.log('⚠️  The player_scores table will be created when the service starts (synchronize: true)');
    }

    // Test basic query
    const versionResult = await client.query('SELECT version()');
    console.log(`🔢 PostgreSQL version: ${versionResult.rows[0].version.split(' ')[0]} ${versionResult.rows[0].version.split(' ')[1]}`);

    client.release();

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure PostgreSQL is running and accessible');
    } else if (error.code === '3D000') {
      console.error('💡 Database does not exist. Create it with: CREATE DATABASE quiz_app;');
    } else if (error.code === '28P01') {
      console.error('💡 Authentication failed. Check username/password');
    }
    
    return false;
  } finally {
    await pool.end();
  }

  console.log('\n🎉 PostgreSQL is healthy and ready!\n');
  return true;
}

if (require.main === module) {
  testDatabaseConnection()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { testDatabaseConnection };
