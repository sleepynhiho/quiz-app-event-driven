#!/bin/bash
echo "Building and deploying frontend..."

# Create frontend dist directory if it doesn't exist
mkdir -p frontend/dist

# Example build commands - adjust based on your frontend framework
# For React:
# cd frontend && npm run build && cp -r build/* ../frontend/dist/

# For Vue:
# cd frontend && npm run build && cp -r dist/* ../frontend/dist/

# For Angular:
# cd frontend && ng build --prod && cp -r dist/quiz-app/* ../frontend/dist/

# For now, create a simple index.html for testing
cat > frontend/dist/index.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
    <title>Quiz App</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <div id="app">
        <h1>Quiz App Frontend</h1>
        <p>Frontend is now served through Nginx!</p>
        <p>API calls will be proxied to: <code>/api/*</code></p>
    </div>
</body>
</html>
EOL

echo "Frontend built successfully!"
echo "You can now run: docker-compose up -d nginx"
