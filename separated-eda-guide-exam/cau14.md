# Liệt kê các đặc tính chất lượng mong muốn đạt được với Event-driven Architecture trong bài lab04. Liệt kê các công cụ có thể sử dụng và các bước cần thực hiện, để kiểm tra các đặc tính chất lương này. Vẽ sơ đồ lưu trữ của kiến trúc để xuất? Liệt kê các công cụ có thể sử dụng và các bước cần thực hiện để cài đặt sơ đồ lưu trữ đề xuất, và để viết mã nguồn ghi và đọc các sự kiện từ hệ thống lưu trữ.

## 1. Đặc tính Chất lượng Mong muốn với EDA

### A. Scalability (Khả năng mở rộng)
**Định nghĩa**: Hệ thống có thể tăng capacity để xử lý nhiều users/requests hơn

**Cách đạt được trong project Quiz App**:
- **Horizontal scaling**: Mỗi service (User, Quiz, Answer, Scoring) có thể scale độc lập bằng cách tăng số container instances
- **Load distribution**: Kafka partitions phân phối events đến multiple consumer instances
- **Stateless services**: Services không lưu state, dễ dàng replicate
- **Database sharding**: PostgreSQL có thể shard theo quizId hoặc userId

**Metrics đo lường**:
- Concurrent users: từ 100 → 10,000 users
- Events/second: từ 1,000 → 100,000 events/s  
- Response time: giữ <200ms khi scale up
- Resource utilization: CPU <80%, Memory <85%

### B. Reliability (Độ tin cậy)
**Định nghĩa**: Hệ thống hoạt động đúng và liên tục, ngay cả khi có failures

**Cách đạt được**:
- **Fault tolerance**: Circuit breaker pattern, service failure không crash toàn hệ thống
- **Event persistence**: Kafka với replication factor=3, đảm bảo events không bị mất
- **Retry mechanisms**: Exponential backoff retry cho failed events
- **Data consistency**: Eventually consistent với compensating transactions
- **Health checks**: Container health monitoring, auto-restart failed services

**Reliability targets**:
- Uptime: 99.9% (8.76 hours downtime/year)
- Data durability: 99.999% (không mất events)
- Recovery time: <30 seconds cho service restart
- MTBF (Mean Time Between Failures): >720 hours


**Benefits**:
- Dễ maintain: Team có thể work độc lập trên mỗi service
- Flexible deployment: Deploy service bất kỳ mà không affect others
- Technology freedom: Chọn tech stack phù hợp cho từng service
- Testing isolation: Unit test service mà không cần dependency


**Performance targets**:
- API response time: <200ms cho 95% requests
- Event processing latency: <50ms từ publish đến consume
- WebSocket message delivery: <20ms
- Cache hit ratio: >90% cho user sessions
- UI responsiveness: <100ms cho user interactions

### C. Availability (Tính khả dụng)
**High Availability design**:
- **Multi-instance deployment**: Mỗi service chạy ≥2 instances
- **Load balancing**: Nginx distribute traffic across instances
- **Database replication**: PostgreSQL master-slave setup
- **Kafka clustering**: 3+ Kafka brokers với leader election
- **Graceful degradation**: Core features vẫn work khi non-critical services down

### D. Consistency (Tính nhất quán)
**Event-driven consistency model**:
- **Eventually consistent**: Data sync across services through events
- **Saga pattern**: Distributed transactions với compensating actions
- **Event sourcing**: Single source of truth từ event sequence
- **CQRS**: Tách read/write models để optimize performance
- **Conflict resolution**: Last-writer-wins với timestamps

## 2. Công cụ Kiểm tra Chất lượng

### A. Performance Testing (Kiểm tra Hiệu suất)

#### A.1 Load Testing Tools
**Công cụ chính**:
- **Apache JMeter**: GUI-based, HTTP/WebSocket testing
- **Artillery**: Node.js based, event-driven load testing  
- **k6**: JavaScript-based, modern load testing
- **Gatling**: Scala-based, high-performance testing

**Test scenarios cho Quiz App**:
```bash
# JMeter test plan
1. Concurrent user registration: 100-1000 users/minute
2. Quiz creation load: 50 quizzes/minute  
3. Real-time quiz participation: 500 concurrent players
4. Answer submission spike: 1000 answers trong 10 seconds
5. WebSocket stress test: 2000 concurrent connections
```

**Metrics cần đo**:
- **Response time**: P50, P95, P99 percentiles
- **Throughput**: Requests/second, Events/second
- **Error rate**: <1% cho normal load, <5% cho peak load
- **Resource utilization**: CPU, Memory, Network I/O
- **Database performance**: Connection pool usage, query time

#### A.2 Implementation Steps
```bash
# Artillery example cho Quiz App
1. Setup test data: users, quizzes, questions
2. Configure load patterns: ramp-up, steady-state, peak
3. Test API endpoints: /auth, /quiz, /answer, /score
4. WebSocket testing: join quiz, receive events
5. Database load: concurrent reads/writes
6. Kafka throughput: event publishing/consuming
```

### B. Reliability Testing (Kiểm tra Độ tin cậy)

#### B.1 Chaos Engineering Tools
**Công cụ**:
- **Chaos Monkey**: Random service termination
- **Chaos Toolkit**: Declarative chaos experiments  
- **Litmus**: Kubernetes-native chaos engineering
- **Pumba**: Docker container chaos testing

**Failure scenarios**:
```yaml
# Chaos experiments cho Quiz App
1. Service failures:
   - Kill random microservice instances  
   - Simulate OOM (Out of Memory)
   - CPU exhaustion attacks

2. Infrastructure failures:
   - Kafka broker crashes
   - PostgreSQL connection loss
   - Redis cache failures
   - Network partitions

3. Dependency failures:
   - External API timeouts
   - Database query failures
   - Message delivery failures
```

#### B.2 Resilience Testing Steps
1. **Baseline measurement**: Establish normal performance metrics
2. **Chaos injection**: Introduce controlled failures
3. **Recovery monitoring**: Measure recovery time và impact
4. **Failure analysis**: Identify weak points
5. **Improvement iteration**: Fix issues và repeat

**Expected behaviors**:
- **Service recovery**: Auto-restart failed containers trong <30s
- **Data consistency**: No data loss during failures
- **Graceful degradation**: Core functionality vẫn available
- **User experience**: Meaningful error messages, no crashes

#### B.3 Data Integrity Testing
**Tools**: Testcontainers, Docker Compose
**Test cases**:
```bash
1. Database transaction rollback testing
2. Kafka message delivery guarantees
3. Event ordering verification  
4. Duplicate event handling
5. Network partition tolerance (CAP theorem)
```


### C. End-to-End Testing (Kiểm tra Tích hợp)

#### C.1 E2E Testing Framework
**Tools**: Cypress, Playwright, Selenium
**Test scenarios**:
```javascript
// Cypress E2E test example
1. User journey: Register → Login → Create Quiz → Start Quiz
2. Multi-player scenario: Host starts quiz, 10 players join, answer questions
3. Real-time updates: Verify leaderboard updates in real-time
4. Error handling: Network disconnection, service failures
5. Cross-browser compatibility: Chrome, Firefox, Safari
```

#### C.2 Contract Testing  
**Tools**: Pact, Spring Cloud Contract
**Purpose**: Verify service integration contracts
```yaml
# Contract testing approach
1. Define event schemas trong shared/types/
2. Generate contract tests từ schemas
3. Verify producer/consumer compatibility  
4. Automate contract validation trong CI/CD
```

## 3. Sơ đồ Kiến trúc Lưu trữ

### 3.1 Tổng quan Storage Architecture 
![alt text](./images_v2/14_storage_architecture.png)

### 3.2 Event Flow Architecture
![alt text](./images_v2/14_event_flow.png)

### 3.5 Data Storage Layers

#### Layer 1: Event Store (Kafka)
**Purpose**: Event sourcing, message streaming
**Components**:
- **Topics**: quiz-events, user-events, scoring-events  
- **Partitions**: Horizontal scaling (theo quizId)
- **Retention**: 7 days cho event replay
- **Replication**: Factor=3 cho high availability

#### Layer 2: Persistent Storage (PostgreSQL)
**Purpose**: ACID transactions, relational data integrity
**Databases**:
- **user_db**: Users, authentication, profiles
- **quiz_db**: Quizzes, questions, quiz participants  
- **answer_db**: Answer submissions, validations
- **scoring_db**: Player scores, leaderboards

**Schema design**:
```sql
-- Event Store table (cross-service)
CREATE TABLE event_store (
  id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (aggregate_id, version)
);
```

#### Layer 3: Cache Layer (Redis)  
**Purpose**: Fast access, session management, temporary state
**Data types**:
- **String**: User sessions, JWT blacklist
- **Hash**: Quiz state, player current status
- **List**: Question queues, answer history
- **Set**: Active participants, online users
- **Sorted Set**: Leaderboards, rankings
- **TTL**: Auto-expiration cho temporary data

#### Layer 4: File Storage
**Purpose**: Static assets, uploads, exports
**Solutions**:
- **Local volumes**: Development environment
- **AWS S3/MinIO**: Production file storage
- **CDN**: Global content delivery

## 4. Cài đặt Kiến trúc Lưu trữ

### 4.1 Infrastructure Setup với Docker Compose

#### A. Kafka Cluster Setup
**Công cụ**: Docker Compose, Confluent Platform, Kafdrop UI

**Configuration trong docker-compose.yml**:
```yaml
# Zookeeper cho Kafka coordination
zookeeper:
  image: confluentinc/cp-zookeeper:7.0.1
  environment:
    ZOOKEEPER_CLIENT_PORT: 2181
    ZOOKEEPER_TICK_TIME: 2000
  volumes:
    - zookeeper-data:/var/lib/zookeeper/data

# Kafka broker với production-ready config  
kafka:
  image: confluentinc/cp-kafka:7.0.1
  depends_on: [zookeeper]
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    KAFKA_AUTO_CREATE_TOPICS_ENABLE: true
    KAFKA_NUM_PARTITIONS: 3
  volumes:
    - kafka-data:/var/lib/kafka/data
```

**Bước setup chi tiết**:
```bash
# 1. Start Kafka infrastructure
docker-compose up -d zookeeper kafka

# 2. Wait for Kafka to be ready
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# 3. Create topics với specific configuration
docker-compose exec kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic quiz-events \
  --partitions 6 \
  --replication-factor 1 \
  --config retention.ms=604800000

# 4. Create consumer groups
docker-compose exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --list

# 5. Monitor topic health
docker-compose exec kafka kafka-log-dirs \
  --bootstrap-server localhost:9092 \
  --describe --json
```

**Topic design cho Quiz App**:
```yaml
Topics:
  quiz-events:
    partitions: 6 (theo quizId hash)
    retention: 7 days
    cleanup.policy: delete
    
  user-events:
    partitions: 3 (theo userId hash)
    retention: 30 days
    cleanup.policy: compact
    
  scoring-events:
    partitions: 6 (theo quizId hash)  
    retention: 14 days
    cleanup.policy: delete
```

#### B. PostgreSQL Multi-Database Setup
**Công cụ**: Docker, pgAdmin, Database migration tools

**Configuration**:
```yaml
# Primary PostgreSQL instance
postgres:
  image: postgres:15
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: password
    POSTGRES_MULTIPLE_DATABASES: user_db,quiz_db,answer_db,scoring_db
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - ./infra/postgres/init:/docker-entrypoint-initdb.d
  ports:
    - "5432:5432"
```

**Database initialization scripts**:
```sql
-- 01-init.sql: Create multiple databases
CREATE DATABASE user_db;
CREATE DATABASE quiz_db;  
CREATE DATABASE answer_db;
CREATE DATABASE scoring_db;

-- 02-quiz-schema.sql
\c quiz_db;
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  host_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  correct_answer JSONB NOT NULL,
  options JSONB,
  points INTEGER DEFAULT 10,
  time_limit INTEGER DEFAULT 30,
  order_index INTEGER NOT NULL
);

-- 03-answers-schema.sql  
\c answer_db;
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL,
  question_id UUID NOT NULL,
  player_id UUID NOT NULL,
  submitted_answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time INTEGER NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(quiz_id, question_id, player_id)
);

-- 04-event-store.sql: Cross-service event store
CREATE TABLE event_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  event_version INTEGER NOT NULL,
  sequence_number BIGSERIAL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(aggregate_id, event_version)
);

CREATE INDEX idx_event_store_aggregate ON event_store(aggregate_id, event_version);
CREATE INDEX idx_event_store_type ON event_store(event_type);
CREATE INDEX idx_event_store_created ON event_store(created_at);
```

**Connection pooling setup**:
```yaml
# pgbouncer cho connection pooling
pgbouncer:
  image: pgbouncer/pgbouncer:latest
  environment:
    DATABASES_HOST: postgres
    DATABASES_PORT: 5432
    DATABASES_USER: postgres
    DATABASES_PASSWORD: password
    POOL_MODE: transaction
    SERVER_RESET_QUERY: DISCARD ALL
    MAX_CLIENT_CONN: 100
    DEFAULT_POOL_SIZE: 20
```

#### C. Redis Cluster Setup 
**Công cụ**: Redis Docker, Redis Sentinel, Redis Cluster

**Single-node development setup**:
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --replica-read-only no
  volumes:
    - redis-data:/data
  ports:
    - "6379:6379"
```

**Production cluster setup**:
```yaml
# Redis cluster với 3 masters + 3 replicas
redis-cluster:
  image: redis:7-alpine
  command: redis-cli --cluster create \
    redis-1:6379 redis-2:6379 redis-3:6379 \
    redis-4:6379 redis-5:6379 redis-6:6379 \
    --cluster-replicas 1 --cluster-yes
```

**Redis configuration cho Quiz App**:
```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10  
save 60 10000
appendonly yes
appendfsync everysec
```

### 4.2 Development Environment Setup

#### A. Local Development với Docker Compose
```bash
# 1. Clone repository
git clone <quiz-app-repo>
cd quiz-app-event-driven

# 2. Start infrastructure services
docker-compose up -d postgres redis kafka zookeeper

# 3. Wait for services to be ready
./scripts/wait-for-services.sh

# 4. Run database migrations
npm run migrate:dev

# 5. Start microservices trong development mode
npm run dev:user-service &
npm run dev:quiz-service &  
npm run dev:answer-service &
npm run dev:scoring-service &

# 6. Start frontend
cd frontend && npm start
```

#### B. Production Deployment
**Orchestration**: Docker Swarm hoặc Kubernetes

**Docker Swarm setup**:
```yaml
# docker-stack.yml
version: '3.8'
services:
  quiz-service:
    image: quiz-app/quiz-service:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 30s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:password@postgres:5432/quiz_db
      KAFKA_BROKERS: kafka:9092
      REDIS_URL: redis://redis:6379
```

**Kubernetes deployment**:
```yaml
# k8s-quiz-service.yml  
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quiz-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: quiz-service
  template:
    metadata:
      labels:
        app: quiz-service
    spec:
      containers:
      - name: quiz-service
        image: quiz-app/quiz-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi" 
            cpu: "500m"
```

## 5. Code Implementation Chi tiết

### 5.1 Event Sourcing & CQRS Implementation

#### A. Event Store Repository
```typescript
// shared/repositories/event-store.repository.ts
@Injectable()
export class EventStoreRepository {
  constructor(
    @InjectRepository(EventStoreEntity)
    private eventStoreRepo: Repository<EventStoreEntity>
  ) {}

  async saveEvent(aggregateId: string, aggregateType: string, 
                  eventType: string, eventData: any, version: number): Promise<void> {
    const event = this.eventStoreRepo.create({
      aggregateId,
      aggregateType,
      eventType,
      eventData,
      eventVersion: version,
      createdAt: new Date()
    });
    
    try {
      await this.eventStoreRepo.save(event);
      // Publish to Kafka cho real-time processing
      await this.kafkaService.publishEvent(event);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new ConflictException(`Optimistic concurrency violation for ${aggregateId}`);
      }
      throw error;
    }
  }

  async getEvents(aggregateId: string, fromVersion?: number): Promise<EventStoreEntity[]> {
    const query = this.eventStoreRepo
      .createQueryBuilder('event')
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .orderBy('event.eventVersion', 'ASC');
    
    if (fromVersion) {
      query.andWhere('event.eventVersion > :fromVersion', { fromVersion });
    }
    
    return await query.getMany();
  }

  async getEventsByType(eventType: string, fromDate: Date): Promise<EventStoreEntity[]> {
    return await this.eventStoreRepo.find({
      where: {
        eventType,
        createdAt: MoreThan(fromDate)
      },
      order: { createdAt: 'ASC' }
    });
  }
}
```

#### B. Aggregate Root Base Class
```typescript
// shared/domain/aggregate-root.ts
export abstract class AggregateRoot {
  protected id: string;
  protected version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];

  constructor(id: string) {
    this.id = id;
  }

  protected addEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.version += 1;
  }

  public getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  public clearEvents(): void {
    this.uncommittedEvents = [];
  }

  public static fromEvents<T extends AggregateRoot>(
    constructor: new (id: string) => T,
    events: DomainEvent[]
  ): T {
    const aggregate = new constructor(events[0].aggregateId);
    
    for (const event of events) {
      aggregate.applyEvent(event, false);
    }
    
    aggregate.clearEvents();
    return aggregate;
  }

  protected abstract applyEvent(event: DomainEvent, isNew: boolean): void;
}
```

#### C. Quiz Aggregate Implementation
```typescript
// services/quiz-service/src/domain/quiz.aggregate.ts
export class QuizAggregate extends AggregateRoot {
  private title: string;
  private questions: Question[] = [];
  private participants: string[] = [];
  private status: QuizStatus = QuizStatus.DRAFT;
  private currentQuestionIndex: number = 0;

  constructor(id: string) {
    super(id);
  }

  public createQuiz(title: string, hostId: string, questions: Question[]): void {
    if (this.version > 0) {
      throw new Error('Quiz already exists');
    }

    const event = new QuizCreatedEvent(this.id, title, hostId, questions);
    this.addEvent(event);
    this.applyEvent(event, true);
  }

  public startQuiz(): void {
    if (this.status !== QuizStatus.READY) {
      throw new Error('Quiz must be in READY status to start');
    }

    const event = new QuizStartedEvent(this.id, this.participants);
    this.addEvent(event);
    this.applyEvent(event, true);
  }

  public addParticipant(playerId: string): void {
    if (this.participants.includes(playerId)) {
      throw new Error('Player already joined');
    }

    const event = new PlayerJoinedEvent(this.id, playerId);
    this.addEvent(event);
    this.applyEvent(event, true);
  }

  protected applyEvent(event: DomainEvent, isNew: boolean): void {
    switch (event.eventType) {
      case 'quiz.created':
        this.applyQuizCreated(event as QuizCreatedEvent);
        break;
      case 'quiz.started':
        this.applyQuizStarted(event as QuizStartedEvent);
        break;
      case 'player.joined':
        this.applyPlayerJoined(event as PlayerJoinedEvent);
        break;
      default:
        throw new Error(`Unknown event type: ${event.eventType}`);
    }

    if (!isNew) {
      this.version += 1;
    }
  }

  private applyQuizCreated(event: QuizCreatedEvent): void {
    this.title = event.title;
    this.questions = event.questions;
    this.status = QuizStatus.DRAFT;
  }

  private applyQuizStarted(event: QuizStartedEvent): void {
    this.status = QuizStatus.ACTIVE;
    this.currentQuestionIndex = 0;
  }

  private applyPlayerJoined(event: PlayerJoinedEvent): void {
    this.participants.push(event.playerId);
  }
}
```

### 5.2 Event Publishing & Consuming

#### A. Advanced Kafka Producer với Retry Logic
```typescript
// shared/services/kafka-producer.service.ts
@Injectable()
export class KafkaProducerService {
  private producer: Producer;
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    initialRetryDelay: 1000,
    maxRetryDelay: 5000,
    retryMultiplier: 2
  };

  async onModuleInit() {
    this.producer = this.kafka.producer({
      groupId: 'quiz-app-producers',
      transactionTimeout: 30000,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
    await this.producer.connect();
  }

  async publishEvent(event: DomainEvent): Promise<void> {
    const message = {
      key: event.aggregateId,
      value: JSON.stringify({
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        payload: event.payload,
        version: event.version,
        timestamp: event.timestamp
      }),
      headers: {
        'event-type': event.eventType,
        'aggregate-type': event.aggregateType,
        'content-type': 'application/json'
      }
    };

    const topic = this.getTopicForEvent(event.eventType);
    
    await this.retryWrapper(async () => {
      await this.producer.send({
        topic,
        messages: [message]
      });
    });

    this.logger.log(`Event published: ${event.eventType} for ${event.aggregateId}`);
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    const groupedByTopic = events.reduce((acc, event) => {
      const topic = this.getTopicForEvent(event.eventType);
      if (!acc[topic]) acc[topic] = [];
      
      acc[topic].push({
        key: event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          'event-type': event.eventType,
          'aggregate-type': event.aggregateType
        }
      });
      
      return acc;
    }, {} as Record<string, any[]>);

    const topicMessages = Object.entries(groupedByTopic).map(([topic, messages]) => ({
      topic,
      messages
    }));

    await this.retryWrapper(async () => {
      await this.producer.sendBatch({ topicMessages });
    });
  }

  private async retryWrapper<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        const delay = Math.min(
          this.retryConfig.initialRetryDelay * Math.pow(this.retryConfig.retryMultiplier, attempt),
          this.retryConfig.maxRetryDelay
        );
        
        this.logger.warn(`Retry attempt ${attempt + 1} after ${delay}ms: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`Failed after ${this.retryConfig.maxRetries} retries: ${lastError.message}`);
  }

  private getTopicForEvent(eventType: string): string {
    const topicMap: Record<string, string> = {
      'quiz.created': 'quiz-events',
      'quiz.started': 'quiz-events',
      'quiz.ended': 'quiz-events',
      'player.joined': 'user-events',
      'answer.submitted': 'answer-events',
      'score.updated': 'scoring-events'
    };
    
    return topicMap[eventType] || 'default-events';
  }
}
```

#### B. Event Consumer với Error Handling
```typescript
// services/scoring-service/src/services/event-consumer.service.ts
@Injectable()
export class ScoringEventConsumerService {
  constructor(
    private scoringService: ScoringService,
    private deadLetterService: DeadLetterService,
    private metricsService: MetricsService
  ) {}

  @EventPattern('answer.submitted')
  async handleAnswerSubmitted(context: KafkaContext): Promise<void> {
    const message = context.getMessage();
    const event = JSON.parse(message.value.toString()) as AnswerSubmittedEvent;
    
    const startTime = Date.now();
    
    try {
      await this.processAnswerSubmitted(event);
      
      // Metrics collection
      this.metricsService.recordEventProcessingTime(
        'answer.submitted',
        Date.now() - startTime
      );
      this.metricsService.incrementEventProcessedCounter('answer.submitted', 'success');
      
    } catch (error) {
      this.logger.error(`Failed to process answer.submitted event: ${error.message}`, {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        error: error.stack
      });

      await this.handleProcessingError(event, error, context);
    }
  }

  private async processAnswerSubmitted(event: AnswerSubmittedEvent): Promise<void> {
    // Idempotency check
    const existingProcessing = await this.checkProcessedEvent(event.eventId);
    if (existingProcessing) {
      this.logger.info(`Event ${event.eventId} already processed, skipping`);
      return;
    }

    // Business logic
    const score = await this.scoringService.calculateScore({
      quizId: event.aggregateId,
      playerId: event.payload.playerId,
      questionId: event.payload.questionId,
      isCorrect: event.payload.isCorrect,
      responseTime: event.payload.responseTime,
      submittedAt: new Date(event.timestamp)
    });

    await this.scoringService.updatePlayerScore(score);

    // Mark as processed
    await this.markEventProcessed(event.eventId);

    // Publish derived events
    if (score.isNewLeader) {
      await this.kafkaProducer.publishEvent(
        new LeaderboardUpdatedEvent(event.aggregateId, score.playerId, score.totalScore)
      );
    }
  }

  private async handleProcessingError(
    event: DomainEvent, 
    error: Error, 
    context: KafkaContext
  ): Promise<void> {
    const retryCount = this.getRetryCount(context);
    const maxRetries = 3;

    if (retryCount < maxRetries) {
      // Schedule retry với exponential backoff
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      
      setTimeout(async () => {
        try {
          await this.processAnswerSubmitted(event as AnswerSubmittedEvent);
        } catch (retryError) {
          await this.handleProcessingError(event, retryError, context);
        }
      }, delay);
      
    } else {
      // Send to dead letter queue
      await this.deadLetterService.sendToDeadLetter({
        originalEvent: event,
        error: error.message,
        retryCount,
        failedAt: new Date()
      });
      
      this.metricsService.incrementEventProcessedCounter('answer.submitted', 'failed');
    }
  }

  private getRetryCount(context: KafkaContext): number {
    const headers = context.getMessage().headers;
    return parseInt(headers?.['retry-count']?.toString() || '0');
  }
}
```

### 5.3 CQRS Read Models & Projections

#### A. Read Model cho Leaderboard
```typescript
// services/scoring-service/src/projections/leaderboard.projection.ts
@Injectable()
export class LeaderboardProjection {
  constructor(
    @InjectRepository(LeaderboardReadModel)
    private leaderboardRepo: Repository<LeaderboardReadModel>,
    private redisService: RedisService
  ) {}

  @EventPattern('score.updated')
  async onScoreUpdated(event: ScoreUpdatedEvent): Promise<void> {
    const { quizId, playerId, totalScore, rank } = event.payload;
    
    // Update persistent read model
    await this.leaderboardRepo.upsert({
      quizId,
      playerId,
      totalScore,
      rank,
      lastUpdated: new Date(event.timestamp)
    }, ['quizId', 'playerId']);

    // Update Redis cache cho real-time access
    await this.updateRedisLeaderboard(quizId, playerId, totalScore);
    
    // Notify via WebSocket
    await this.notifyLeaderboardUpdate(quizId, {
      playerId,
      totalScore,
      rank
    });
  }

  private async updateRedisLeaderboard(quizId: string, playerId: string, score: number): Promise<void> {
    const key = `leaderboard:${quizId}`;
    
    // Use Redis Sorted Set cho efficient ranking
    await this.redisService.zadd(key, score, playerId);
    await this.redisService.expire(key, 3600); // 1 hour TTL
  }

  async getLeaderboard(quizId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const cacheKey = `leaderboard:${quizId}`;
    
    // Try Redis first
    const cachedData = await this.redisService.zrevrange(
      cacheKey, 0, limit - 1, 'WITHSCORES'
    );
    
    if (cachedData.length > 0) {
      return this.formatLeaderboardData(cachedData);
    }

    // Fallback to database
    const dbData = await this.leaderboardRepo.find({
      where: { quizId },
      order: { totalScore: 'DESC', lastUpdated: 'ASC' },
      take: limit
    });

    // Populate cache
    if (dbData.length > 0) {
      const pipeline = this.redisService.pipeline();
      dbData.forEach(entry => {
        pipeline.zadd(cacheKey, entry.totalScore, entry.playerId);
      });
      pipeline.expire(cacheKey, 3600);
      await pipeline.exec();
    }

    return dbData.map(entry => ({
      playerId: entry.playerId,
      totalScore: entry.totalScore,
      rank: entry.rank
    }));
  }
}
```

#### B. Event Handler với Saga Pattern
```typescript
// services/quiz-service/src/sagas/quiz-completion.saga.ts
@Injectable()
export class QuizCompletionSaga {
  private sagaStates = new Map<string, QuizCompletionState>();

  @EventPattern('quiz.ended')
  async onQuizEnded(event: QuizEndedEvent): Promise<void> {
    const sagaId = `quiz-completion-${event.aggregateId}`;
    const state = new QuizCompletionState(sagaId, event.aggregateId);
    
    this.sagaStates.set(sagaId, state);
    
    // Step 1: Finalize all scores
    await this.finalizeScores(event.aggregateId);
    state.markScoresFinalized();
    
    // Step 2: Generate quiz report
    await this.generateQuizReport(event.aggregateId);
    state.markReportGenerated();
    
    // Step 3: Notify participants
    await this.notifyParticipants(event.aggregateId, event.payload.participants);
    state.markParticipantsNotified();
    
    // Complete saga
    state.markCompleted();
    this.sagaStates.delete(sagaId);
  }

  @EventPattern('score.finalization.failed')
  async onScoreFinalizationFailed(event: ScoreFinalizationFailedEvent): Promise<void> {
    const sagaId = `quiz-completion-${event.aggregateId}`;
    const state = this.sagaStates.get(sagaId);
    
    if (state) {
      // Compensating action: revert quiz to ended-with-errors state
      await this.revertQuizCompletion(event.aggregateId);
      state.markFailed('Score finalization failed');
    }
  }

  private async finalizeScores(quizId: string): Promise<void> {
    try {
      await this.kafkaProducer.publishEvent(
        new FinalizeScoresCommand(quizId)
      );
    } catch (error) {
      await this.kafkaProducer.publishEvent(
        new ScoreFinalizationFailedEvent(quizId, error.message)
      );
      throw error;
    }
  }

  private async generateQuizReport(quizId: string): Promise<void> {
    // Generate comprehensive quiz analytics
    const analytics = await this.analyticsService.generateQuizReport(quizId);
    
    await this.kafkaProducer.publishEvent(
      new QuizReportGeneratedEvent(quizId, analytics)
    );
  }

  private async notifyParticipants(quizId: string, participants: string[]): Promise<void> {
    const notifications = participants.map(playerId => 
      new ParticipantNotificationEvent(quizId, playerId, 'quiz_completed')
    );
    
    await this.kafkaProducer.publishBatch(notifications);
  }
}
```