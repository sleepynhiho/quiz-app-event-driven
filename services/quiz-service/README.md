# Quiz Service

Event-driven microservice for managing quizzes in the Quiz App.

## Features

- Create quizzes with multiple questions
- Start and manage quiz sessions
- Real-time question presentation
- WebSocket support for live updates
- Kafka integration for event messaging
- Redis for session management

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/create` | Create a new quiz |
| POST | `/api/quiz/:id/start` | Start a quiz session |
| POST | `/api/quiz/:id/next` | Present next question |
| GET | `/api/health` | Health check |

## Kafka Events

### Published Events
- `quiz.started`: Quiz session started
- `question.presented`: New question presented
- `time.up`: Question time expired
- `quiz.ended`: Quiz session ended

### Subscribed Events
- `player.joined`: Player joined quiz
- `score.updated`: Player score updated

## Database Schema

### Tables
- `quizzes`: Quiz metadata
- `questions`: Quiz questions with options
- `quiz_players`: Player participation and scores

## Development Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL, Kafka, Redis (via Docker)

### Installation

1. **Start infrastructure services:**
   ```bash
   # From project root
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   cd services/quiz-service
   npm install
   ```

3. **Set up environment:**
   ```bash
   # Copy .env file and adjust if needed
   cp .env.example .env
   ```

4. **Start development server:**
   
   **Windows:**
   ```cmd
   start-dev.bat
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

   **Or manually:**
   ```bash
   npm run start:dev
   ```

### Environment Variables

```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiz_app
DB_USER=postgres
DB_PASSWORD=password

# Kafka
KAFKA_BROKER=localhost:9092

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redispassword

# CORS
CORS_ORIGIN=*
```

## API Usage Examples

### Create Quiz
```bash
curl -X POST http://localhost:3001/api/quiz/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Quiz",
    "questions": [
      {
        "content": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": "4"
      }
    ]
  }'
```

### Start Quiz
```bash
curl -X POST http://localhost:3001/api/quiz/{quiz-id}/start
```

### Next Question
```bash
curl -X POST http://localhost:3001/api/quiz/{quiz-id}/next
```

## WebSocket Events

Connect to `ws://localhost:3001` to receive real-time updates:

- `quiz.started`
- `question.presented`
- `time.up`
- `quiz.ended`

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Production Build

```bash
npm run build
npm run start:prod
```
