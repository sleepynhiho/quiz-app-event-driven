#!/bin/bash

# Start script for Quiz App in Development Mode

echo "🚀 Starting Quiz App in Development Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose pull

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "✅ Quiz App is running in development mode!"
echo ""
echo "📍 Available Services:"
echo "   • API Gateway (Nginx): http://localhost"
echo "   • Quiz Service: http://localhost:3001"
echo "   • PostgreSQL: localhost:5432"
echo "   • Kafka: localhost:9092"
echo "   • Redis: localhost:6379"
echo ""
echo "🛠️  Development Tools:"
echo "   • Kafka UI: http://localhost:8080"
echo "   • pgAdmin: http://localhost:8081 (admin@quiz-app.com / admin)"
echo "   • Redis Commander: http://localhost:8082"
echo ""
echo "📋 Useful Commands:"
echo "   • View logs: docker-compose logs -f [service-name]"
echo "   • Stop services: docker-compose down"
echo "   • Restart service: docker-compose restart [service-name]"
