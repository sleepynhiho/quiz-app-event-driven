# PowerShell script to test the Kafka consumer
# This script publishes a test player.joined event to verify the consumer works

Write-Host "Testing Kafka Consumer for player.joined events..." -ForegroundColor Green

try {
    # Run the test script
    node test-player-joined.js
    Write-Host "Test event sent successfully!" -ForegroundColor Green
    Write-Host "Check the quiz-service console for processing logs." -ForegroundColor Yellow
} catch {
    Write-Host "Error running test: $($_.Exception.Message)" -ForegroundColor Red
}
