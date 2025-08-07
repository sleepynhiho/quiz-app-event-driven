# Quiz Service

A microservice for managing quizzes in a real-time quiz application.

## Features

- Create quizzes with multiple-choice questions
- Generate unique quiz codes
- JWT-based authentication
- PostgreSQL database integration
- Kafka event publishing
- Input validation
- Error handling

## API Endpoints

### POST /api/quiz/create

Creates a new quiz with questions.

**Authentication Required:** Yes (JWT Bearer token)

**Request Body:**
```json
{
  "title": "My Quiz Title",
  "questions": [
    {
      "content": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correctAnswer": 2
    },
    {
      "content": "Which planet is closest to the Sun?",
      "options": ["Venus", "Mercury", "Earth", "Mars"],
      "correctAnswer": 1
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "quizId": "123e4567-e89b-12d3-a456-426614174000",
    "code": "ABC123",
    "title": "My Quiz Title",
    "questions": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "content": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "correctAnswer": 2,
        "quizId": "123e4567-e89b-12d3-a456-426614174000"
      }
    ]
  },
  "timestamp": "2025-08-04T12:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Server error

### GET /api/health

Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "OK",
  "service": "quiz-service",
  "timestamp": "2025-08-04T12:00:00.000Z",
  "uptime": 3600
}
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Required variables:
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `KAFKA_BROKER` - Kafka broker URL
- `JWT_SECRET` - JWT signing secret

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database Schema

### Quizzes Table
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Questions Table
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE
);
```

### Quiz Players Table
```sql
CREATE TABLE quiz_players (
  id UUID PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, player_id)
);
```

## Kafka Events

### Published Events

#### quiz.created
Published when a new quiz is created.

**Topic:** `quiz.created`
**Payload:**
```json
{
  "quizId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "My Quiz Title",
  "hostId": "789e0123-e89b-12d3-a456-426614174002"
}
```

### Consumed Events

#### player.joined
Consumed when a player joins a quiz (published by user-service).

**Topic:** `player.joined`
**Payload:**
```json
{
  "playerId": "456e7890-e89b-12d3-a456-426614174003",
  "quizId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Action:** Inserts a record into the `quiz_players` table with the player information.

## Testing

### Testing the Kafka Consumer

To test the player.joined event consumer:

```bash
# Start the quiz service (make sure Kafka and PostgreSQL are running)
npm run dev

# In another terminal, run the test script
node test-player-joined.js
```

The test script will publish a sample `player.joined` event to Kafka, and you should see the consumer processing it in the quiz service logs.

## Development

The service uses TypeScript and includes:
- Express.js framework
- PostgreSQL with native driver
- KafkaJS for event publishing and consuming
- Joi for validation
- JWT for authentication
- Helmet for security
- CORS support

### Kafka Integration
- **Producer**: Publishes `quiz.created` events when new quizzes are created
- **Consumer**: Listens to `player.joined` events and updates the quiz_players table

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "timestamp": "2025-08-04T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {},
    "timestamp": "2025-08-04T12:00:00.000Z"
  }
}
```
