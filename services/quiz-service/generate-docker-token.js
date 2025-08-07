const jwt = require('jsonwebtoken');

// Use the secret from docker-compose.yml
const JWT_SECRET = '5dad9040183348ba83ae86bcd14f535a';

// Create a payload for testing
const payload = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'test@example.com'
};

// Generate a token that will work with your docker container
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '24h'
});

console.log('Use this token for testing your Docker container:');
console.log(token);
