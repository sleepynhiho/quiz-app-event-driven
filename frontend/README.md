# Frontend Deployment Guide

## Tổng quan
Nginx hiện tại được cấu hình để:
- Serve static files của frontend từ `/usr/share/nginx/html`
- Proxy các API calls từ `/api/*` đến quiz-service
- Hỗ trợ WebSocket connections tại `/ws/*`

## Cách deploy frontend

### 1. Build frontend của bạn
Tùy thuộc vào framework bạn sử dụng:

**React:**
```bash
cd frontend
npm run build
cp -r build/* dist/
```

**Vue:**
```bash
cd frontend
npm run build
# Build output đã sẵn trong dist/
```

**Angular:**
```bash
cd frontend
ng build --prod
cp -r dist/quiz-app/* dist/
```

### 2. Sử dụng script tự động
Chạy một trong các script sau:

**Windows:**
```cmd
build-frontend.bat
```

**Linux/Mac:**
```bash
chmod +x build-frontend.sh
./build-frontend.sh
```

### 3. Start containers
```bash
docker-compose up -d
```

## Cấu trúc URL
- `http://localhost/` - Frontend (static files)
- `http://localhost/api/*` - Backend API
- `http://localhost/ws/*` - WebSocket connections
- `http://localhost/health` - Health check

## Caching Strategy
- Static assets (JS, CSS, images): Cache 1 năm
- HTML files: No cache (để đảm bảo cập nhật mới nhất)

## Development Workflow
1. Develop frontend như bình thường
2. Build frontend khi cần test production
3. Copy build files vào `frontend/dist/`
4. Restart nginx container: `docker-compose restart nginx`

## Notes
- File build phải được đặt trong `frontend/dist/` để nginx có thể serve
- Mọi route không bắt đầu bằng `/api/` hoặc `/ws/` sẽ được serve như static files
- SPA routing được hỗ trợ với `try_files $uri $uri/ /index.html`
