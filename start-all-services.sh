#!/bin/bash

echo "🚀 Starting all Quiz App services..."

# Function to check if port is in use
check_port() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Kill existing processes on ports
echo "🧹 Cleaning up existing processes..."
kill $(lsof -ti:3000) 2>/dev/null || true
kill $(lsof -ti:3001) 2>/dev/null || true
kill $(lsof -ti:3002) 2>/dev/null || true
kill $(lsof -ti:3003) 2>/dev/null || true

sleep 2

# Start User Service (Port 3000)
echo "▶️  Starting User Service (Port 3000)..."
cd services/user-service
npm start > ../../logs/user-service.log 2>&1 &
USER_PID=$!
cd ../..

# Start Quiz Service (Port 3001)  
echo "▶️  Starting Quiz Service (Port 3001)..."
cd services/quiz-service
yarn start:dev > ../../logs/quiz-service.log 2>&1 &
QUIZ_PID=$!
cd ../..

# Start Answer Service (Port 3002)
echo "▶️  Starting Answer Service (Port 3002)..."
cd services/answer-service
yarn start:dev > ../../logs/answer-service.log 2>&1 &
ANSWER_PID=$!
cd ../..

# Start Scoring Service (Port 3003)
echo "▶️  Starting Scoring Service (Port 3003)..."
cd services/scoring-service
yarn start:dev > ../../logs/scoring-service.log 2>&1 &
SCORING_PID=$!
cd ../..

echo "⏳ Waiting for services to start..."
sleep 10

# Check services
echo "🔍 Checking service health..."

echo "User Service (3000):"
curl -s http://localhost:3000/health || echo "❌ Not responding"

echo -e "\nQuiz Service (3001):"
curl -s http://localhost:3001/api/health || echo "❌ Not responding"

echo -e "\nAnswer Service (3002):"
curl -s http://localhost:3002/api/health || echo "❌ Not responding"

echo -e "\nScoring Service (3003):"
curl -s http://localhost:3003/health || echo "❌ Not responding"

echo -e "\n\n✅ Services started!"
echo "PIDs: User=$USER_PID, Quiz=$QUIZ_PID, Answer=$ANSWER_PID, Scoring=$SCORING_PID"
echo "Logs are in ./logs/ directory"
echo "To stop all services, run: ./stop-all-services.sh" 