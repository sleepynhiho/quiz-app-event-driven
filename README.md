# 🎯 Quiz App - Event-Driven System

Một ứng dụng quiz trực tuyến được xây dựng theo kiến trúc **Event-Driven Microservices**, sử dụng Kafka để xử lý real-time messaging và WebSocket để cập nhật điểm số theo thời gian thực.

## 📋 Tổng quan dự án

### 🎮 Tính năng chính
- **Tạo Quiz**: Tạo quiz với nhiều câu hỏi trắc nghiệm
- **Chơi Quiz**: Chọn quiz và trả lời câu hỏi
- **Chấm điểm Real-time**: Điểm số được cập nhật ngay lập tức thông qua Kafka events
- **Bảng xếp hạng**: Hiển thị bảng điểm của tất cả người chơi
- **Quiz Selection**: Chọn quiz từ danh sách có sẵn hoặc chơi demo quiz

### 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   User Service  │    │  Quiz Service   │
│   (React)       │    │   (Express.js)  │    │   (NestJS)      │
│   Port: 3004    │    │   Port: 3000    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌┴─────────────────┐    ┌─────────────────┐
         │ Answer Service  │    │      Kafka       │    │ Scoring Service │
         │   (NestJS)      │    │   (Confluent)    │    │   (NestJS)      │
         │   Port: 3002    │    │   Port: 9092     │    │   Port: 3003    │
         └─────────────────┘    └──────────────────┘    └─────────────────┘
                                         │
         ┌─────────────────┐    ┌────────┴────────┐    ┌─────────────────┐
         │   PostgreSQL    │    │      Redis      │    │    Kafdrop      │
         │   Port: 5432    │    │   Port: 6379    │    │   Port: 9000    │
         └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** với TypeScript
- **CSS3** với responsive design
- **Axios** cho API calls
- **UUID** cho unique IDs

### Backend Services
- **Quiz Service**: NestJS + TypeORM + PostgreSQL
- **Answer Service**: NestJS + TypeORM + PostgreSQL  
- **Scoring Service**: NestJS + TypeORM + PostgreSQL
- **User Service**: Express.js + Prisma + PostgreSQL

### Infrastructure
- **PostgreSQL**: Database cho tất cả services
- **Apache Kafka**: Message streaming cho event-driven architecture
- **Redis**: Caching và session management
- **Docker Compose**: Container orchestration
- **Nginx**: Reverse proxy (config sẵn sàng)

### Event Flow
```
User Action → Frontend → Service → Kafka Event → Consumer Service → Database → Real-time Update
```

## 🚀 Cài đặt và chạy dự án

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL client (optional)

### 1. Clone và setup
```bash
git clone <repository-url>
cd quiz-app-event-driven
```

### 2. Khởi động Infrastructure
```bash
# Khởi động PostgreSQL, Kafka, Redis
docker-compose up -d
```

### 3. Khởi động Backend Services
```bash
# Terminal 1 - Quiz Service
cd services/quiz-service
npm install
npm run start:dev

# Terminal 2 - Answer Service  
cd services/answer-service
npm install
npm run start:dev

# Terminal 3 - Scoring Service
cd services/scoring-service
npm install
npm run start:dev

# Terminal 4 - User Service
cd services/user-service
npm install
npm start
```

### 4. Khởi động Frontend
```bash
# Terminal 5 - Frontend
cd frontend
npm install
npm start
```

### 5. Truy cập ứng dụng
- **Frontend**: http://localhost:3004
- **Kafdrop (Kafka UI)**: http://localhost:9000

## 📊 API Endpoints

### Quiz Service (Port 3001)
```
GET    /api/quiz           # Lấy danh sách quiz
GET    /api/quiz/demo      # Lấy demo quiz
GET    /api/quiz/:id       # Lấy quiz theo ID
POST   /api/quiz/create    # Tạo quiz mới
POST   /api/quiz/:id/start # Bắt đầu quiz
POST   /api/quiz/:id/next  # Câu hỏi tiếp theo
GET    /api/health         # Health check
```

### Answer Service (Port 3002)
```
POST   /api/answers/submit # Gửi câu trả lời
GET    /api/health         # Health check
```

### Scoring Service (Port 3003)
```
GET    /api/scores/player/:playerId/quiz/:quizId  # Điểm của player
GET    /api/scores/leaderboard/:quizId            # Bảng xếp hạng
GET    /api/health                                # Health check
```

### User Service (Port 3000)
```
POST   /auth/login         # Đăng nhập
POST   /auth/register      # Đăng ký
POST   /quiz/join          # Tham gia quiz
```

## 🔥 Kafka Events

### Published Events
- `quiz.started`: Quiz được bắt đầu
- `question.presented`: Câu hỏi mới được hiển thị
- `answer.submitted`: Câu trả lời được gửi
- `score.updated`: Điểm số được cập nhật

### Consumer Groups
- `quiz-service-group`: Xử lý player events
- `scoring-service-group`: Xử lý answer events

## 🗄️ Database Schema

### Tables
- **quizzes**: Thông tin quiz
- **questions**: Câu hỏi với options và correct_answer (integer index)
- **answers**: Câu trả lời của người chơi
- **player_scores**: Điểm số của người chơi
- **users**: Thông tin người dùng

### Key Features
- UUID primary keys
- JSONB for options storage  
- Foreign key constraints với CASCADE delete
- Indexes cho performance
- Timestamps cho audit trail

## 🎮 Cách sử dụng

### 1. Đăng ký/Đăng nhập
- Tạo tài khoản mới hoặc đăng nhập
- Hệ thống sẽ lưu session

### 2. Tạo Quiz
- Chuyển sang tab "🎯 Tạo Quiz"
- Nhập tiêu đề quiz
- Thêm câu hỏi với 4 lựa chọn
- Chọn đáp án đúng (A, B, C, D)
- Click "Tạo Quiz"

### 3. Chơi Quiz
- Ở tab "🎮 Chơi Quiz"
- Click "📋 Chọn Quiz" để xem danh sách
- Chọn quiz muốn chơi (Demo hoặc quiz đã tạo)
- Trả lời từng câu hỏi
- Xem kết quả real-time và bảng xếp hạng

### 4. Xem kết quả
- Điểm số được cập nhật ngay lập tức
- Bảng xếp hạng hiển thị tất cả người chơi
- Có thể chơi lại hoặc chuyển câu hỏi tiếp theo

## 🔧 Development

### Code Structure
```
quiz-app-event-driven/
├── frontend/                 # React frontend
├── services/
│   ├── quiz-service/        # Quiz management (NestJS)
│   ├── answer-service/      # Answer processing (NestJS)  
│   ├── scoring-service/     # Score calculation (NestJS)
│   └── user-service/        # User management (Express)
├── infra/
│   ├── postgres/init/       # Database init scripts
│   ├── nginx/              # Nginx configuration
│   └── kafka/              # Kafka configuration
├── shared/                  # Shared types và utilities
└── docker-compose.yml       # Infrastructure setup
```

### Key Implementation Details
- **Event-Driven**: Kafka events cho loose coupling
- **Microservices**: Mỗi service có responsibility riêng
- **Real-time**: WebSocket + Kafka cho live updates
- **Type Safety**: TypeScript ở cả frontend và backend
- **Database**: PostgreSQL với proper normalization
- **Containerized**: Docker Compose cho easy setup

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Kiểm tra ports 3000-3004, 5432, 9092, 6379
2. **Database connection**: Ensure PostgreSQL container is running
3. **Kafka connection**: Check Kafka và Zookeeper containers
4. **TypeScript errors**: Run `npm install` in each service

### Logs
```bash
# View service logs
docker-compose logs postgres
docker-compose logs kafka
docker-compose logs redis

# View application logs  
tail -f logs/quiz-service.log
tail -f logs/answer-service.log
tail -f logs/scoring-service.log
```

## 📈 Future Enhancements

- [ ] Real-time multiplayer với WebSocket rooms
- [ ] Timer cho từng câu hỏi
- [ ] Different question types (multiple choice, true/false, text)
- [ ] Quiz categories và tags
- [ ] Advanced analytics và reporting
- [ ] Mobile responsive improvements
- [ ] Docker deployment với Kubernetes
- [ ] CI/CD pipeline
- [ ] API rate limiting
- [ ] Advanced caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Developed with ❤️ using Event-Driven Architecture & Microservices**

