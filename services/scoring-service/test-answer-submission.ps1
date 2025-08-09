# Test script to send answer submission message to Kafka
Write-Host "Testing answer submission to Kafka..." -ForegroundColor Green

# Install kafkajs if not already installed
if (-not (Test-Path "node_modules/kafkajs")) {
    Write-Host "Installing kafkajs..." -ForegroundColor Yellow
    npm install kafkajs
}

# Run the test
Write-Host "Sending test message to answer.submitted topic..." -ForegroundColor Yellow
node test-answer-submission.js

Write-Host "Test completed. Check the scoring service logs for message processing." -ForegroundColor Green
