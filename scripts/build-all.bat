@echo off

REM Build script for all services (Windows)
echo Building Quiz App services...

REM Build all Docker images
echo Building Docker images...
docker-compose -f docker-compose.prod.yml build --no-cache

echo Build completed successfully!
echo.
echo To start the application in production mode:
echo   docker-compose -f docker-compose.prod.yml up -d
echo.
echo To start in development mode:
echo   docker-compose up -d