@echo off
echo Building and deploying frontend...

REM Create frontend dist directory if it doesn't exist
if not exist "frontend\dist" mkdir frontend\dist

REM Example build commands - adjust based on your frontend framework
REM For React:
REM cd frontend && npm run build && xcopy /E /I /Y build\* ..\frontend\dist\

REM For Vue:
REM cd frontend && npm run build && xcopy /E /I /Y dist\* ..\frontend\dist\

REM For Angular:
REM cd frontend && ng build --prod && xcopy /E /I /Y dist\quiz-app\* ..\frontend\dist\

REM For now, create a simple index.html for testing
echo ^<!DOCTYPE html^> > frontend\dist\index.html
echo ^<html^> >> frontend\dist\index.html
echo ^<head^> >> frontend\dist\index.html
echo     ^<title^>Quiz App^</title^> >> frontend\dist\index.html
echo     ^<meta charset="utf-8"^> >> frontend\dist\index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1"^> >> frontend\dist\index.html
echo ^</head^> >> frontend\dist\index.html
echo ^<body^> >> frontend\dist\index.html
echo     ^<div id="app"^> >> frontend\dist\index.html
echo         ^<h1^>Quiz App Frontend^</h1^> >> frontend\dist\index.html
echo         ^<p^>Frontend is now served through Nginx!^</p^> >> frontend\dist\index.html
echo         ^<p^>API calls will be proxied to: ^<code^>/api/*^</code^>^</p^> >> frontend\dist\index.html
echo     ^</div^> >> frontend\dist\index.html
echo ^</body^> >> frontend\dist\index.html
echo ^</html^> >> frontend\dist\index.html

echo Frontend built successfully!
echo You can now run: docker-compose up -d nginx
