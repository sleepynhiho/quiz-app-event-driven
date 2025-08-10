# Answer Service

A NestJS microservice that handles quiz answer submissions and publishes events to Kafka for real-time scoring.

## Features

- **Answer Submission**: Process and validate player answers
- **Duplicate Prevention**: Ensure players can only answer each question once
- **Kafka Integration**: Publish `answer.submitted` events for scoring service
- **Database Storage**: Persist all answers with timestamps
- **REST API**: Endpoints for answer management
- **Health Check**: Service monitoring endpoint

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Message Queue**: Kafka (KafkaJS)
- **Validation**: Class Validator & Class Transformer
- **Package Manager**: Yarn

## API Endpoints

### Answer Management
- `POST /api/answer/submit` - Submit an answer
- `GET /api/answer/player/{playerId}/quiz/{quizId}` - Get player's answers for a quiz
- `GET /api/answer/question/{questionId}` - Get all answers for a question

### Health Check
- `GET /api/health` - Service health status

## Database Schema

### Answers Table
```sql
CREATE TABLE answers (
    id UUID PRIMARY KEY,
    player_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    question_id UUID NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    answer VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);
```

## Kafka Events

### Published Events

#### answer.submitted
```json
{
  "playerId": "string (UUID)",
  "quizId": "string (UUID)", 
  "questionId": "string (UUID)",
  "isCorrect": "boolean",
  "submittedAt": "string (ISO timestamp)"
}
```

## Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=quiz_app

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=answer-service
KAFKA_GROUP_ID=answer-service-group

# Service
PORT=3002
NODE_ENV=development
```

## Quick Start

### 1. Start Infrastructure
```bash
# From project root
docker-compose up -d
```

### 2. Start Answer Service
```bash
cd services/answer-service
yarn start:dev
```

### 3. Test API
```bash
# Submit an answer
curl -X POST http://localhost:3002/api/answer/submit \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "123e4567-e89b-12d3-a456-426614174000",
    "quizId": "987fcdeb-51a2-43d1-9b47-123456789abc", 
    "questionId": "456789ab-cdef-1234-5678-90abcdef1234",
    "answer": "A"
  }'

# Get player answers
curl http://localhost:3002/api/answer/player/123e4567-e89b-12d3-a456-426614174000/quiz/987fcdeb-51a2-43d1-9b47-123456789abc

# Health check
curl http://localhost:3002/api/health
```

## Architecture

### Event Flow
1. **Answer Submission**: Player submits answer via POST /api/answer/submit
2. **Validation**: Check for duplicates and validate format
3. **Answer Evaluation**: Determine if answer is correct (TODO: integrate with Quiz Service)
4. **Database Storage**: Save answer to PostgreSQL
5. **Event Publishing**: Publish `answer.submitted` to Kafka
6. **Score Processing**: Scoring Service consumes event and updates scores

### Service Integration
- **Quiz Service**: Should provide question details and correct answers (TODO)
- **Scoring Service**: Consumes `answer.submitted` events
- **User Service**: Provides player authentication context

## Development

```bash
# Install dependencies
yarn install

# Development mode
yarn start:dev

# Build
yarn build

# Production mode
yarn start:prod

# Testing
yarn test
yarn test:e2e
yarn test:cov

# Linting
yarn lint
```

## TODO / Future Enhancements

- [ ] Integrate with Quiz Service for answer validation
- [ ] Add time-based submission validation
- [ ] Implement answer encryption for security
- [ ] Add answer analytics and reporting
- [ ] Support different question types (multiple choice, text, etc.)
- [ ] Add rate limiting for answer submissions
- [ ] Implement answer revision capabilities
- [ ] Add comprehensive testing suite

## Error Handling

- **Duplicate Answers**: Returns 400 Bad Request
- **Invalid UUID**: Returns 400 Bad Request with validation errors
- **Database Errors**: Returns 500 Internal Server Error
- **Kafka Errors**: Logged but don't block answer submission

## Monitoring

The service exposes health check endpoint at `/api/health` for monitoring tools.

```json
{
  "status": "OK",
  "service": "answer-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```
