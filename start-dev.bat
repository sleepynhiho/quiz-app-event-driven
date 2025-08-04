@echo off
REM Start script for Quiz App in Development Mode (Windows)

echo 🚀 Starting Quiz App in Development Mode...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Pull latest images
echo 📥 Pulling latest images...
docker-compose pull

REM Build and start services
echo 🔨 Building and starting services...
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
docker-compose ps

echo.
echo ✅ Quiz App is running in development mode!
echo.
echo 📍 Available Services:
echo    • API Gateway (Nginx): http://localhost
echo    • Quiz Service: http://localhost:3001
echo    • PostgreSQL: localhost:5432
echo    • Kafka: localhost:9092
echo    • Redis: localhost:6379
echo.
echo 🛠️  Development Tools:
echo    • Kafka UI: http://localhost:8080
echo    • pgAdmin: http://localhost:8081 (admin@quiz-app.com / admin)
echo    • Redis Commander: http://localhost:8082
echo.
echo 📋 Useful Commands:
echo    • View logs: docker-compose logs -f [service-name]
echo    • Stop services: docker-compose down
echo    • Restart service: docker-compose restart [service-name]
echo.
pause
