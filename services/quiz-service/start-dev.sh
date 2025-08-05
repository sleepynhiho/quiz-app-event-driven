#!/bin/bash

echo "Starting Quiz Service Development Environment..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Wait for infrastructure services to be ready
echo "Waiting for infrastructure services..."

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
while ! nc -z localhost 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Wait for Kafka
echo "Waiting for Kafka..."
while ! nc -z localhost 9092; do
  sleep 1
done
echo "Kafka is ready!"

# Wait for Redis
echo "Waiting for Redis..."
while ! nc -z localhost 6379; do
  sleep 1
done
echo "Redis is ready!"

echo "All infrastructure services are ready!"
echo "Starting Quiz Service..."

# Start the application in development mode
npm run start:dev
