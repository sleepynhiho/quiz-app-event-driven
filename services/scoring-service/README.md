# Scoring Service

A NestJS microservice responsible for calculating and managing quiz player scores in the quiz application.

## Features

- **Kafka Consumer**: Subscribes to `answer.submitted` topic to process player answers
- **Score Calculation**: Computes and updates player scores based on correct answers
- **Database Integration**: Uses TypeORM with PostgreSQL to store player scores
- **REST API**: Provides endpoints to retrieve scores and leaderboards
- **Real-time Processing**: Processes answers in real-time as they are submitted

## Environment Variables

Create a `.env` file with the following variables:

```env
# Environment
NODE_ENV=development

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

## Installation

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Score Management
- `GET /scores/player/:playerId/quiz/:quizId` - Get player's score for a specific quiz
- `GET /scores/quiz/:quizId/leaderboard?limit=10` - Get quiz leaderboard

## Kafka Integration

### Consumed Topics

#### `answer.submitted`
Processes player answer submissions with the following payload:
```json
{
  "playerId": "uuid",
  "quizId": "uuid", 
  "questionId": "uuid",
  "isCorrect": boolean,
  "submittedAt": "ISO timestamp"
}
```

## Database Schema

### `player_scores` Table
- `id` (UUID) - Primary key
- `player_id` (UUID) - Player identifier
- `quiz_id` (UUID) - Quiz identifier
- `total_score` (INTEGER) - Player's total score
- `correct_answers` (INTEGER) - Number of correct answers
- `total_answers` (INTEGER) - Total number of answers submitted
- `last_answered_at` (TIMESTAMP) - Last answer submission time
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

## Architecture

The service follows a modular architecture:

```
src/
├── controllers/          # REST API controllers
├── dto/                 # Data transfer objects
├── entities/            # TypeORM entities
├── services/            # Business logic services
├── app.module.ts        # Main application module
├── app.controller.ts    # Base controller
├── app.service.ts       # Base service
└── main.ts             # Application entry point
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development

```bash
# Watch mode
npm run start:dev

# Build
npm run build

# Lint
npm run lint
```

## Dependencies

- **NestJS**: Progressive Node.js framework
- **TypeORM**: TypeScript ORM for database operations
- **KafkaJS**: Kafka client for Node.js
- **PostgreSQL**: Database driver
- **Class Validator**: Validation decorators
- **Class Transformer**: Object transformation utilities
