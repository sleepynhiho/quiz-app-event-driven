#!/bin/bash

# Build script for all services
echo "Building Quiz App services..."

# Build all Docker images
echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "Build completed successfully!"
echo ""
echo "To start the application in production mode:"
echo "  docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "To start in development mode:"
echo "  docker-compose up -d"