# Quiz App Docker Setup

This directory contains the complete Docker Compose setup for the Quiz Application microservices.

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │    │ Quiz Service│    │ PostgreSQL  │
│ (Gateway)   │────│             │────│ (Database)  │
│   :80       │    │   :3001     │    │   :5432     │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                   ┌─────────────┐    ┌─────────────┐
                   │    Kafka    │    │    Redis    │
                   │ (Messages)  │    │  (Cache)    │
                   │   :9092     │    │   :6379     │
                   └─────────────┘    └─────────────┘
```

## 🚀 Quick Start

### Development Mode
```bash
# Windows
./start-dev.bat

# Linux/Mac
./start-dev.sh
```

### Production Mode
```bash
docker-compose up -d
```

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| **Nginx** | 80 | API Gateway and Load Balancer |
| **Quiz Service** | 3001 | Main quiz microservice |
| **PostgreSQL** | 5432 | Primary database |
| **Kafka** | 9092 | Message broker |
| **Zookeeper** | 2181 | Kafka coordination |
| **Redis** | 6379 | Caching and sessions |

### Development Tools (Dev Mode Only)
| Tool | Port | Credentials |
|------|------|-------------|
| **Kafka UI** | 8080 | - |
| **pgAdmin** | 8081 | admin@quiz-app.com / admin |
| **Redis Commander** | 8082 | - |

## 🛠️ Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Start with development tools
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Rebuild a service
docker-compose up --build [service-name]
```

### Database Operations
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d quiz_app

# View database logs
docker-compose logs -f postgres

# Backup database
docker-compose exec postgres pg_dump -U postgres quiz_app > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres quiz_app < backup.sql
```

### Kafka Operations
```bash
# List Kafka topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Create a topic
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic test-topic

# Consume messages
docker-compose exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic quiz.created --from-beginning
```

## 🔧 Configuration

### Environment Variables

**Development (.env.development)**
- Includes debug settings
- Uses local file volumes
- Exposes additional ports

**Production (.env.production)**
- Optimized for performance
- Security hardened
- Resource limits applied

### Volume Mounts

- `postgres_data`: PostgreSQL data persistence
- `redis_data`: Redis data persistence
- Development: Source code volumes for hot reloading

## 🔒 Security

### Production Security Features
- Non-root user containers
- Security headers (Nginx)
- Rate limiting
- Network isolation
- Secrets management

### Development Security
- Default passwords (change in production)
- Debug modes enabled
- Additional exposed ports

## 📊 Monitoring & Health Checks

All services include health checks:
- **Database**: Connection and query tests
- **Kafka**: Broker availability
- **Services**: HTTP endpoint checks
- **Redis**: Command execution

### Health Check Endpoints
```bash
# Service health
curl http://localhost:3001/api/health

# Nginx health
curl http://localhost/health
```

## 🐛 Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check logs
docker-compose logs [service-name]

# Check if ports are available
netstat -tulpn | grep [port]

# Restart specific service
docker-compose restart [service-name]
```

**Database connection issues:**
```bash
# Verify PostgreSQL is running
docker-compose exec postgres pg_isready -U postgres

# Check network connectivity
docker-compose exec quiz-service nc -zv postgres 5432
```

**Kafka connection issues:**
```bash
# Check Kafka broker
docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Verify Zookeeper
docker-compose exec zookeeper zkCli.sh ls /
```

### Performance Optimization

**For production:**
1. Adjust resource limits in docker-compose.yml
2. Tune PostgreSQL configuration
3. Configure Kafka for your message volume
4. Set up proper logging rotation

**For development:**
1. Use volume mounts for faster rebuilds
2. Enable hot reloading
3. Use development Docker images

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale quiz service
docker-compose up --scale quiz-service=3

# Load balancing handled by Nginx
```

### Vertical Scaling
Adjust resource limits in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.50'
      memory: 512M
```

## 🔄 CI/CD Integration

The Docker setup is ready for CI/CD:
- Multi-stage builds for optimization
- Health checks for deployment verification
- Environment-specific configurations
- Volume persistence for data

## 📝 Notes

- All data is persisted in Docker volumes
- Services use Docker networking for communication
- Environment variables are configurable per deployment
- Hot reloading available in development mode
