# Scoring Service Implementation

## Overview

The Scoring Service is a NestJS microservice that processes quiz answer submissions and maintains real-time player scores. It consumes messages from Kafka and persists score data to PostgreSQL.

## Architecture

### Event-Driven Design
- **Event Consumer**: Subscribes to `answer.submitted` Kafka topic
- **Score Processor**: Calculates and updates player scores in real-time
- **Database Persistence**: Stores aggregated scores in PostgreSQL
- **REST API**: Provides endpoints for score retrieval and leaderboards

### Key Components

#### 1. Kafka Consumer (`KafkaConsumerService`)
```typescript
// Subscribes to answer.submitted topic
await consumer.subscribe({ topics: ['answer.submitted'] });

// Processes each message
await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const answerData = JSON.parse(message.value.toString());
    await this.scoringService.processAnswerSubmitted(answerData);
  }
});
```

#### 2. Score Calculation (`ScoringService`)
```typescript
async processAnswerSubmitted(answerData: AnswerSubmittedDto) {
  // Find or create player score record
  let playerScore = await this.findPlayerScore(answerData.playerId, answerData.quizId);
  
  // Update scores
  playerScore.totalAnswers += 1;
  if (answerData.isCorrect) {
    playerScore.correctAnswers += 1;
    playerScore.totalScore += this.calculatePoints();
  }
  
  await this.playerScoreRepository.save(playerScore);
}
```

#### 3. Database Schema
```sql
CREATE TABLE player_scores (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL,
  quiz_id UUID NOT NULL,
  total_score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  last_answered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, quiz_id)
);
```

## Message Flow

1. **Answer Submission**: Player submits an answer via quiz-service
2. **Event Publishing**: Quiz-service publishes to `answer.submitted` topic
3. **Event Consumption**: Scoring-service consumes the message
4. **Score Processing**: Calculate and update player's score
5. **Database Update**: Persist updated score to PostgreSQL
6. **Leaderboard Update**: Real-time leaderboard data available via API

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
KAFKA_CLIENT_ID=scoring-service
KAFKA_GROUP_ID=scoring-service-group

# Service
PORT=3003
```

### Kafka Topic Schema
```json
{
  "topic": "answer.submitted",
  "key": "playerId",
  "value": {
    "playerId": "string (UUID)",
    "quizId": "string (UUID)",
    "questionId": "string (UUID)",
    "isCorrect": "boolean",
    "submittedAt": "string (ISO timestamp)"
  }
}
```

## API Endpoints

### Score Retrieval
```http
GET /scores/player/{playerId}/quiz/{quizId}
```
Returns individual player score for a specific quiz.

### Leaderboard
```http
GET /scores/quiz/{quizId}/leaderboard?limit=10
```
Returns top players for a quiz, ordered by score and submission time.

### Health Check
```http
GET /health
```
Service health status.

## Scoring Algorithm

### Current Implementation
- **Correct Answer**: +10 points
- **Incorrect Answer**: +0 points
- **Tie Breaker**: Earlier submission time wins

### Future Enhancements
- Time-based scoring (faster answers = more points)
- Question difficulty multipliers
- Streak bonuses
- Penalty for incorrect answers

## Error Handling

### Kafka Consumer Errors
- Message validation using class-validator
- Error logging and graceful continuation
- Dead letter queue for failed messages (future enhancement)

### Database Errors
- Transaction rollback on failures
- Retry logic for connection issues
- Data consistency checks

## Monitoring and Observability

### Logging
- Structured logging with Winston (future)
- Message processing metrics
- Error tracking and alerting

### Health Checks
- Database connectivity
- Kafka consumer status
- Memory and CPU metrics

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:e2e
```

### Manual Testing
```bash
# Send test message to Kafka
node test-answer-submission.js

# Or use PowerShell
.\test-answer-submission.ps1
```

## Deployment

### Local Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker (Future)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["npm", "run", "start:prod"]
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live leaderboards
2. **Caching**: Redis for frequently accessed scores
3. **Analytics**: Player performance analytics and insights
4. **Scaling**: Horizontal scaling with Kafka partitioning
5. **Event Sourcing**: Complete audit trail of score changes
