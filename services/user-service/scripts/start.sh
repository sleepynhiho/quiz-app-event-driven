#!/bin/sh

echo "Starting User Service..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z postgres 5432; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "Database is ready!"

# Wait a bit more to ensure database is fully initialized
sleep 5

# Push database schema
echo "Pushing database schema..."
npm run db:push

# Start the application
echo "Starting application..."
exec npm start 