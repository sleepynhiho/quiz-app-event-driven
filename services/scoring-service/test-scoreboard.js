const axios = require('axios');

async function testScoreboardEndpoint() {
  try {
    const baseUrl = 'http://localhost:3003/api';
    const quizId = '550e8400-e29b-41d4-a716-446655440010'; // From our test data
    
    console.log('🧪 Testing Scoreboard Endpoint');
    console.log(`📋 Quiz ID: ${quizId}\n`);
    
    // Test the scoreboard endpoint
    const response = await axios.get(`${baseUrl}/scores/scoreboard/${quizId}`);
    
    console.log('✅ Scoreboard endpoint response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Validate response structure
    const { quizId: returnedQuizId, players } = response.data;
    
    if (returnedQuizId !== quizId) {
      console.error('❌ Quiz ID mismatch in response');
      return;
    }
    
    if (!Array.isArray(players)) {
      console.error('❌ Players is not an array');
      return;
    }
    
    console.log(`\n📊 Found ${players.length} players in scoreboard`);
    
    // Check if players are sorted by score (DESC) and updatedAt (ASC)
    for (let i = 1; i < players.length; i++) {
      const current = players[i];
      const previous = players[i - 1];
      
      if (current.score > previous.score) {
        console.error(`❌ Sorting error: Player ${i} has higher score than player ${i-1}`);
        return;
      }
      
      if (current.score === previous.score) {
        const currentTime = new Date(current.updatedAt);
        const previousTime = new Date(previous.updatedAt);
        
        if (currentTime < previousTime) {
          console.error(`❌ Tie-breaking error: Player ${i} has earlier update time but is listed after player ${i-1}`);
          return;
        }
      }
    }
    
    console.log('✅ Scoreboard is correctly sorted');
    
    // Test individual player properties
    players.forEach((player, index) => {
      const { playerId, score, updatedAt } = player;
      
      // Validate UUID format for playerId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(playerId)) {
        console.error(`❌ Player ${index + 1}: Invalid playerId UUID format`);
        return;
      }
      
      // Validate score is a number
      if (typeof score !== 'number') {
        console.error(`❌ Player ${index + 1}: Score is not a number`);
        return;
      }
      
      // Validate updatedAt is a valid ISO string
      if (isNaN(Date.parse(updatedAt))) {
        console.error(`❌ Player ${index + 1}: Invalid updatedAt format`);
        return;
      }
      
      console.log(`✅ Player ${index + 1}: ${playerId} - ${score} points (${updatedAt})`);
    });
    
    console.log('\n🎉 Scoreboard endpoint test passed!');
    
  } catch (error) {
    if (error.response) {
      console.error(`❌ HTTP Error ${error.response.status}:`, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Test with invalid UUID
async function testInvalidUUID() {
  try {
    console.log('\n🧪 Testing Invalid UUID Validation');
    const baseUrl = 'http://localhost:3003/api';
    const invalidQuizId = 'invalid-uuid';
    
    const response = await axios.get(`${baseUrl}/scores/scoreboard/${invalidQuizId}`);
    console.error('❌ Should have failed with invalid UUID');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Correctly rejected invalid UUID with 400 status');
      console.log('   Message:', error.response.data.message);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

async function runTests() {
  await testScoreboardEndpoint();
  await testInvalidUUID();
}

runTests();
