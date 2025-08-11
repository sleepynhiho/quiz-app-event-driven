# Quiz App - Event-Driven Microservices Architecture

A real-time quiz application built with microservices architecture using Node.js, React, PostgreSQL, Redis, Kafka, and WebSocket for live interactions.

## Project Structure

```
quiz-app-event-driven/
├── docker-compose.yml              # Development environment
├── docker-compose.prod.yml         # Production environment
├── scripts/
│   ├── build-all.sh                # Build script for Linux/Mac
│   └── build-all.bat               # Build script for Windows
├── services/
│   ├── user-service/               # Authentication and user management
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── scripts/
│   │   │   ├── start.sh
│   │   │   └── wait-for-it.sh
│   │   └── src/
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── routes/
│   │       ├── services/
│   │       └── utils/
│   ├── quiz-service/               # Quiz management and WebSocket
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── controllers/
│   │       ├── dto/
│   │       ├── entities/
│   │       ├── gateways/
│   │       └── services/
│   ├── answer-service/             # Answer processing and validation
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── controllers/
│   │       ├── dto/
│   │       ├── entities/
│   │       └── services/
│   └── scoring-service/            # Score calculation and leaderboard
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           ├── controllers/
│           ├── dto/
│           ├── entities/
│           └── services/
├── frontend/                       # React frontend application
│   ├── Dockerfile
│   ├── nginx.conf                  # Nginx configuration
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       ├── services/
│       └── types/
├── infra/                          # Infrastructure configuration
│   └── postgres/
│       └── init/                   # Database initialization scripts
│           ├── 01-init.sql
│           ├── 02-quiz-schema.sql
│           └── 03-answers-schema.sql
└── shared/                         # Shared TypeScript types
    └── types/
        └── index.ts
```

## Technology Stack

### Backend Services
- **User Service**: Express.js with Prisma ORM
- **Quiz Service**: NestJS with TypeORM and Socket.IO
- **Answer Service**: NestJS with TypeORM
- **Scoring Service**: NestJS with TypeORM

### Frontend
- **React**: TypeScript, Axios, Socket.IO Client

### Infrastructure
- **Database**: PostgreSQL 15
- **Message Broker**: Apache Kafka with Zookeeper
- **Cache**: Redis 7
- **Reverse Proxy**: Nginx
- **Containerization**: Docker and Docker Compose

### Development Tools
- **TypeScript**: For type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Installation and Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd quiz-app-event-driven
```

2. **Start development environment**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:3000
- User Service: http://localhost:3004
- Quiz Service: http://localhost:3001
- Answer Service: http://localhost:3002
- Scoring Service: http://localhost:3003
- pgAdmin: http://localhost:8080 (admin@quiz.com / admin123)
- Kafdrop (Kafka UI): http://localhost:9000

### Production Deployment

1. **Build all services**
```bash
./scripts/build-all.sh
# or on Windows
scripts\build-all.bat
```

2. **Start production environment**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Access the application**
- Frontend: http://localhost:80

### Local Development

For individual service development:

```bash
# Install dependencies for each service
cd services/quiz-service && npm install
cd services/answer-service && npm install
cd services/scoring-service && npm install
cd services/user-service && npm install
cd frontend && npm install

# Start individual services
cd services/quiz-service && npm run start:dev
cd services/answer-service && npm run start:dev
cd services/scoring-service && npm run start:dev
cd services/user-service && npm start
cd frontend && npm start
```

## API Documentation

### User Service (Port 3004)
```
POST /auth/register          # User registration
POST /auth/login             # User login
GET  /auth/profile           # Get user profile
POST /quiz/join              # Join a quiz
GET  /quiz/player/:playerId  # Get player's quizzes
```

### Quiz Service (Port 3001)
```
GET    /api/quiz                    # Get all quizzes
POST   /api/quiz/create             # Create new quiz
GET    /api/quiz/:id                # Get quiz by ID
POST   /api/quiz/:id/start          # Start quiz
POST   /api/quiz/:id/next           # Next question
GET    /api/quiz/question/:id       # Get question details
GET    /api/quiz/:id/state          # Get quiz state
GET    /api/quiz/demo               # Get demo quiz
```

### Answer Service (Port 3002)
```
POST /api/answer/submit             # Submit answer
GET  /api/answer/player/:playerId   # Get player answers
```

### Scoring Service (Port 3003)
```
GET /api/scores/player/:playerId/quiz/:quizId    # Player score
GET /api/scores/quiz/:quizId                     # Quiz leaderboard
```

## Core Workflows

### 1. Player Joins Quiz
1. Player submits join request to User Service
2. User Service validates and creates player_quiz record
3. User Service publishes `player.joined` event to Kafka
4. Quiz Service receives event and broadcasts to WebSocket clients
5. Frontend updates participant list in real-time

### 2. Quiz Start
1. Host triggers start via Quiz Service API
2. Quiz Service updates quiz state in Redis
3. Quiz Service publishes `quiz.started` event to Kafka
4. Quiz Service broadcasts to WebSocket clients
5. Frontend shows quiz start notification
6. First question is automatically presented

### 3. Question Presentation
1. Quiz Service selects next question from database
2. Sets 30-second deadline and updates Redis state
3. Publishes `question.presented` event with question data
4. Broadcasts to WebSocket clients
5. Frontend displays question and starts timer
6. Automatic timeout scheduled for 30 seconds

### 4. Answer Submission
1. Player submits answer to Answer Service
2. Answer Service validates:
   - Quiz is active
   - Question is current
   - Within time deadline
   - No duplicate submission
3. Fetches correct answer from Quiz Service
4. Saves answer to database
5. Publishes `answer.submitted` event to Kafka

### 5. Score Calculation
1. Scoring Service receives `answer.submitted` event
2. Calculates score with three components:
   - Base score: 100 points (with question weight)
   - Time bonus: Up to 50 points (based on speed)
   - Order bonus: 20 points (1st correct), 10 points (2nd correct)
3. Updates player_scores table
4. Publishes `score.updated` event to Kafka
5. Quiz Service broadcasts score update via WebSocket
6. Frontend refreshes leaderboard

### 6. Time Up
1. Quiz Service timer expires after 30 seconds
2. Publishes `time.up` event to Kafka
3. Broadcasts to WebSocket clients
4. Frontend disables answer submission
5. Automatically proceeds to next question or ends quiz

### 7. Quiz End
1. Quiz Service detects all questions completed
2. Collects final scores from quiz_players table
3. Updates Redis with quiz end state
4. Publishes `quiz.ended` event with final results
5. Broadcasts to WebSocket clients
6. Frontend displays final leaderboard and results

## Real-time Features

### WebSocket Events
- **quiz.started**: Quiz begins notification
- **question.presented**: New question display
- **time.up**: Question timeout notification
- **score.updated**: Live leaderboard updates
- **player.joined**: New participant notification
- **quiz.ended**: Final results display

### Kafka Topics
- **player.joined**: Player participation events
- **quiz.started**: Quiz initiation events
- **question.presented**: Question broadcasting
- **answer.submitted**: Answer processing events
- **score.updated**: Score calculation results
- **time.up**: Timeout notifications
- **quiz.ended**: Quiz completion events

## Database Schema

### Core Tables
- **users**: User accounts and authentication
- **quizzes**: Quiz metadata and configuration
- **questions**: Quiz questions with options and correct answers
- **quiz_players**: Player-quiz participation tracking
- **player_quiz**: User service join records
- **answers**: Submitted answers with timestamps
- **player_scores**: Calculated scores and rankings

### Key Relationships
- One quiz has many questions (1:N)
- One quiz has many players (N:M)
- One player can answer many questions (1:N)
- Scores are calculated per player per quiz (N:M)

## Environment Variables

### Database Configuration
```
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=quiz_app
```

### Redis Configuration
```
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redispassword
```

### Kafka Configuration
```
KAFKA_BROKER=kafka:29092
KAFKA_CLIENT_ID=service-name
```

### Authentication
```
JWT_SECRET=your-super-secret-jwt-key
```

## Monitoring and Debugging

### Service Health Checks
All services include Docker health checks and are accessible via:
- HTTP health endpoints
- Docker container status
- Service dependency validation

### Kafka Monitoring
- **Kafdrop UI**: http://localhost:9000
- Topic management and message inspection
- Consumer group monitoring

### Database Management
- **pgAdmin**: http://localhost:8080
- Full PostgreSQL administration
- Query execution and schema management

### Log Management
- Container logs via `docker-compose logs <service-name>`
- Structured logging with service identification
- Error tracking and debugging information

## Development Guidelines

### Code Style
- TypeScript for all new code
- ESLint configuration enforced
- Consistent error handling patterns
- Comprehensive input validation

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for critical workflows
- Performance testing for real-time features

### Security Considerations
- JWT-based authentication
- Input sanitization and validation
- CORS configuration
- Rate limiting on API endpoints
- Secure environment variable handling

## Troubleshooting

### Common Issues
1. **Services not starting**: Check Docker Compose logs
2. **Database connection errors**: Verify PostgreSQL health
3. **Kafka connection issues**: Ensure Zookeeper is running
4. **WebSocket connection problems**: Check Quiz Service status
5. **CORS errors**: Verify frontend-backend URL configuration

### Performance Optimization
- Redis caching for quiz state
- Database indexing for queries
- Kafka partitioning for scalability
- Nginx compression and caching
- Docker image optimization

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.