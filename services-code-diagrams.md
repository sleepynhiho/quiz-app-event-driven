# Services Code Diagrams - C4 Model Level 4

## 1. Quiz Service

**Architecture**: NestJS microservice with TypeORM, PostgreSQL, Kafka + WebSocket + Redis

### Overview
Quiz Service is the central coordinator of the system, responsible for managing the entire quiz lifecycle from creation, start, to completion. This service uses event-driven architecture and real-time communication.

### Component Interactions
- **QuizController** receives HTTP requests and delegates to **QuizService** for business logic processing
- **QuizService** interacts with 3 repositories (Quiz, Question, QuizPlayer) to manage data persistence
- When quiz events occur (start/end/player join), **QuizService** uses **KafkaService** to publish events to scoring service
- **QuizGateway** handles WebSocket connections to provide real-time updates to frontend clients
- **RedisService** caches active quiz sessions and player states to improve performance

### Data Flow
1. Host creates quiz → Store in PostgreSQL → Cache session in Redis
2. Players join quiz → Update QuizPlayer entity → Notify via WebSocket
3. Quiz starts → Publish start event via Kafka → Real-time broadcast to all connected clients
4. Questions are served in order → Timer tracking via Redis

---

## 2. Answer Service

**Architecture**: NestJS microservice focused on answer processing and validation

### Overview  
Answer Service handles all answer submissions from players, validates correctness, calculates response time and forwards to scoring service. This is the highest throughput service in the system.

### Processing Pipeline
- **AnswerController** receives answer submissions from frontend
- **AnswerService** performs validation pipeline:
  1. Check duplicate answers (1 player can only answer once per question)
  2. Validate quiz state and question timing
  3. Calculate response time based on submission timestamp
  4. Determine correctness by comparing with correct answer
- Answers are persisted to PostgreSQL with full audit trail
- **KafkaService** publishes AnswerSubmittedDto events to scoring service for real-time score calculation

### Key Validation Rules
- Prevent duplicate submissions per player per question
- Enforce question time limits
- Validate quiz active state before accepting answers

---

## 3. Scoring Service

**Architecture**: Event-driven NestJS microservice with complex scoring algorithms

### Overview
Scoring Service is the main consumer of answer events, implementing sophisticated scoring logic with bonus calculations. This service maintains real-time leaderboards and player statistics.

### Scoring Algorithm
- **KafkaConsumerService** consumes answer events from answer service
- **ScoringService** implements multi-factor scoring:
  1. **Base Points**: From question configuration
  2. **Speed Bonus**: Faster response = higher bonus
  3. **Order Bonus**: First correct answers get extra points
  4. **Accuracy Tracking**: Maintain correctness percentage

### Real-time Updates
- Each answer event triggers score recalculation
- **PlayerScore** entity is updated with new totals, averages, ranks
- Score changes are published via Kafka to notify quiz service
- **ScoreController** provides REST endpoints for leaderboard queries

### Performance Optimizations
- In-memory tracking of correct answer order
- Cached question start times for accurate response time calculation
- Bulk score updates to reduce database hits

---

## 4. User Service

**Architecture**: Express.js with Prisma ORM, different from other NestJS services

### Overview
User Service handles authentication/authorization and user profile management. This is the entry point for user registration and login flows, using JWT-based authentication.

### Authentication Flow
1. **AuthController** receives registration/login requests
2. **AuthService** handles password hashing, credential validation
3. **JWTUtil** generates access/refresh token pairs
4. User data persisted via **Prisma ORM** with PostgreSQL
5. Successful auth events are published via **KafkaUtil** for analytics

### Middleware Chain
- **ValidationMiddleware** validates request schemas before reaching controllers
- **AuthMiddleware** verifies JWT tokens for protected routes
- Error handling middleware catches and formats errors consistently

### Player Quiz Management
- **QuizController** manages player participation records
- **PlayerQuiz** model tracks join/leave events, final scores, completion status
- Integration with quiz service via Kafka events to sync player states

### Technology Differences
- Uses Express.js instead of NestJS for lighter weight
- Prisma ORM instead of TypeORM for better type safety
- Manual dependency injection instead of NestJS's built-in DI
- Swagger integration for API documentation 