#!/bin/bash

echo "🛑 Stopping all Quiz App services..."

# Kill processes on specific ports
echo "Stopping User Service (Port 3000)..."
kill $(lsof -ti:3000) 2>/dev/null || echo "No process on port 3000"

echo "Stopping Quiz Service (Port 3001)..."
kill $(lsof -ti:3001) 2>/dev/null || echo "No process on port 3001"

echo "Stopping Answer Service (Port 3002)..."
kill $(lsof -ti:3002) 2>/dev/null || echo "No process on port 3002"

echo "Stopping Scoring Service (Port 3003)..."
kill $(lsof -ti:3003) 2>/dev/null || echo "No process on port 3003"

echo "✅ All services stopped!" 