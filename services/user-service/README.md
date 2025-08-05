# User Service

A complete User Service built with Express.js, PostgreSQL, and Kafka using ES6 modules.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Quiz Management**: Join quizzes and track participation
- **Kafka Integration**: Publish events when users join quizzes
- **Database**: PostgreSQL with Prisma ORM
- **API Documentation**: Swagger/OpenAPI documentation
- **Docker Support**: Complete containerized setup

## Tech Stack

- **Backend**: Express.js with ES6 modules
- **Database**: PostgreSQL with Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Message Queue**: Kafka (KafkaJS)
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Quiz Management
- `POST /quiz/join` - Join a quiz (requires authentication)
- `GET /quiz/my-quizzes` - Get user's joined quizzes (requires authentication)

### Health Check
- `GET /health` - Service health check

### Documentation
- `GET /api-docs` - Swagger API documentation

## Database Schema

The database schema is defined in `prisma/schema.prisma`:

### Users Table
```prisma
model User {
  id           String        @id @default(cuid())
  username     String        @unique
  email        String        @unique
  passwordHash String
  createdAt    DateTime      @default(now())
  playerQuizzes PlayerQuiz[]

  @@map("users")
}
```

### Player Quiz Table
```prisma
model PlayerQuiz {
  id        String   @id @default(cuid())
  playerId  String
  quizId    String
  joinedAt  DateTime @default(now())
  player    User     @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([playerId, quizId])
  @@map("player_quiz")
}
```

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-service
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

## Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/user_service_db?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Kafka Configuration
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=user-service
```

## API Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Join a quiz (requires JWT token)
```bash
curl -X POST http://localhost:3000/quiz/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "quizId": "quiz-123"
  }'
```

## Kafka Events

The service publishes the following events to Kafka:

### player.joined
Published when a user joins a quiz:
```json
{
  "playerId": "uuid-of-player",
  "quizId": "quiz-123"
}
```

## Project Structure

```
user-service/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── validations/     # Request validation schemas
│   ├── utils/           # Utility functions
│   └── database/        # Database connection and migrations
├── docker-compose.yml   # Docker services configuration
├── Dockerfile          # Application container
├── prisma/             # Prisma schema and migrations
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database with test data
- `npm test` - Run tests

## Docker Commands

- `docker-compose up -d` - Start all services in background
- `docker-compose down` - Stop all services
- `docker-compose logs -f user-service` - View application logs
- `docker-compose exec postgres psql -U postgres -d user_service_db` - Access database
- `npm run db:studio` - Open Prisma Studio for database management

## Troubleshooting

### Docker Issues

If you encounter issues with Docker:

1. **Clean up and rebuild:**
   ```bash
   docker-compose down -v
   docker system prune -f
   docker-compose up -d --build
   ```

2. **Check logs:**
   ```bash
   docker-compose logs -f user-service
   docker-compose logs -f postgres
   ```

3. **Database connection issues:**
   ```bash
   # Check if database is running
   docker-compose ps
   
   # Access database directly
   docker-compose exec postgres psql -U postgres -d user_service_db
   ```

4. **Prisma issues:**
   ```bash
   # Generate Prisma client
   docker-compose exec user-service npm run db:generate
   
   # Push schema to database
   docker-compose exec user-service npm run db:push
   ```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with Joi
- Helmet.js for security headers
- CORS configuration
- Non-root Docker user

## Monitoring

- Health check endpoint at `/health`
- Docker health checks for all services
- Graceful shutdown handling
- Error logging and handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 