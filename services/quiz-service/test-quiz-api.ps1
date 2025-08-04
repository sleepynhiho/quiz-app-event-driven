# Valid token generated using your actual JWT secret
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc1NDMyOTkyNiwiZXhwIjoxNzU0NDE2MzI2fQ.ajNP8mO5foKZtm6eTOOexcry8fzoK9F2SvM8JSQ9HfM"

# For Docker container (uncomment and use this instead if testing Docker)
# $token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc1NDMzMDExNSwiZXhwIjoxNzU0NDE2NTE1fQ.y1fZEh62Fvb9WUAw4ATQkfxEcrHEEv6v0mu2av5sJOs"

# Quiz data
$body = @{
  title = "Test Quiz from PowerShell"
  questions = @(
    @{
      content = "What is 2 + 2?"
      options = @("1", "3", "4", "5")
      correctAnswer = 2
    },
    @{
      content = "What is the capital of France?"
      options = @("London", "Berlin", "Paris", "Madrid")
      correctAnswer = 2
    }
  )
} | ConvertTo-Json -Depth 5

Write-Host "Sending request to create quiz..."
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/quiz/create" `
      -Method Post `
      -Headers @{Authorization="Bearer $token"} `
      -ContentType "application/json" `
      -Body $body
    
    Write-Host "Quiz created successfully!"
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Error creating quiz:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Response: $($_.ErrorDetails.Message)"
    } else {
        Write-Host "No detailed error message available"
    }
}
