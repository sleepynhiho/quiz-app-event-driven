@echo off
echo Starting Quiz Service Development Environment...

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Wait for infrastructure services
echo Waiting for infrastructure services...

REM Check if PostgreSQL is running
:check_postgres
echo Checking PostgreSQL connection...
timeout /t 2 /nobreak > NUL
powershell -Command "try { $null = New-Object System.Net.Sockets.TcpClient('localhost', 5432); Write-Host 'PostgreSQL is ready!'; exit 0 } catch { exit 1 }" > NUL 2>&1
if %errorlevel% neq 0 goto check_postgres

REM Check if Kafka is running  
:check_kafka
echo Checking Kafka connection...
timeout /t 2 /nobreak > NUL
powershell -Command "try { $null = New-Object System.Net.Sockets.TcpClient('localhost', 9092); Write-Host 'Kafka is ready!'; exit 0 } catch { exit 1 }" > NUL 2>&1
if %errorlevel% neq 0 goto check_kafka

REM Check if Redis is running
:check_redis
echo Checking Redis connection...
timeout /t 2 /nobreak > NUL
powershell -Command "try { $null = New-Object System.Net.Sockets.TcpClient('localhost', 6379); Write-Host 'Redis is ready!'; exit 0 } catch { exit 1 }" > NUL 2>&1
if %errorlevel% neq 0 goto check_redis

echo All infrastructure services are ready!
echo Starting Quiz Service...

REM Start the application in development mode
npm run start:dev
