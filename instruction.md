Quiz System - Architecture & Flow Documentation
Overview
Hệ thống Quiz gồm nhiều microservice giao tiếp với nhau qua REST API và Kafka events.
Các service chính:

User Service – Quản lý người dùng và tham gia quiz

Quiz Service – Quản lý quiz, câu hỏi, trạng thái phòng

Answer Service – Xử lý câu trả lời

Scoring Service – Tính điểm và quản lý bảng điểm

Frontend – Giao diện người chơi & host, nhận dữ liệu realtime qua WebSocket

Database Schema
User Service
Table: users

Field	Type	Note
id (PK)	UUID	User ID
username	string	
email	string	
passwordHash	string	
createdAt	timestamp	

Table: player_quiz

Field	Type	Note
id (PK)	UUID	
playerId (FK)	UUID	→ users.id
quizId	string	
joinedAt	timestamp	

Quiz Service
Table: quizzes

Field	Type	Note
id (PK)	UUID	
hostId (FK)	UUID	→ users.id
code	string	unique
title	string	
createdAt	timestamp	

Table: questions

Field	Type	Note
id (PK)	UUID	
quizId (FK)	UUID	→ quizzes.id
content	text	
options	jsonb	Danh sách lựa chọn
correctAnswer	string	
order	integer	Thứ tự câu hỏi

Table: quiz_players

Field	Type	Note
quizId (FK)	UUID	
playerId (FK)	UUID	
score	integer	default 0
PK	(quizId, playerId)	

Scoring Service
Table: player_scores

Field	Type	Note
quizId (FK)	UUID	
playerId (FK)	UUID	
score	integer	
updatedAt	timestamp	
PK	(quizId, playerId)	

Answer Service
Table: answers

Field	Type	Note
id (PK)	UUID	
playerId (FK)	UUID	→ users.id
quizId (FK)	UUID	→ quizzes.id
questionId (FK)	UUID	→ questions.id
submittedAt	timestamp	
answer	string	
isCorrect	boolean	

API Endpoints
User Service
Method	Endpoint	Description
POST	/auth/register	Đăng ký người dùng
POST	/auth/login	Đăng nhập (JWT)
POST	/quiz/join	Tham gia quiz bằng mã

Quiz Service
Method	Endpoint	Description
POST	/quiz/create	Tạo quiz
POST	/quiz/:id/start	Bắt đầu quiz
POST	/quiz/:id/next	Chuyển sang câu hỏi tiếp theo

Scoring Service
Method	Endpoint	Description
GET	/scoreboard/:quizId	Xem bảng điểm quiz

Answer Service
Method	Endpoint	Description
POST	/answer/submit	Gửi câu trả lời

Kafka Topics Summary
Topic	Publish by	Subscribe by	Payload Example
player.joined	User Service	Quiz Service	{ playerId, quizId, isGuest, displayName }
quiz.started	Quiz Service	Frontend	{ quizId }
question.presented	Quiz Service	Frontend	{ quizId, questionId, content, options, deadline }
answer.submitted	Answer Service	Scoring Service	{ playerId, quizId, questionId, isCorrect }
score.updated	Scoring Service	Quiz Service	{ playerId, quizId, score }
time.up	Quiz Service	Frontend	{ quizId, questionId }
quiz.ended	Quiz Service	Frontend	{ quizId, result[] }

Event Flows
1. Người chơi tham gia quiz
Frontend → POST /quiz/join → User Service

User Service:

Kiểm tra quiz hợp lệ

Ghi record vào player_quiz

Gửi event player.joined

Quiz Service nhận player.joined → Cập nhật danh sách người chơi

2. Nộp câu trả lời
Frontend → POST /answer/submit → Answer Service

Answer Service:

Kiểm tra hợp lệ (câu hỏi, thời gian, chưa nộp)

Đánh giá đúng/sai

Gửi event answer.submitted

Scoring Service nhận answer.submitted → Xử lý tính điểm → Gửi score.updated

Quiz Service nhận score.updated → Broadcast WebSocket + cập nhật bảng điểm

3. Tính điểm (Scoring)
Dựa trên:

Thứ tự trả lời

Thời gian trả lời

Trọng số câu hỏi

Kết quả lưu vào player_scores

4. Hết thời gian trả lời
Quiz Service theo dõi deadline

Khi hết giờ → gửi event time.up → Frontend dừng cho phép trả lời

5. Kết thúc quiz
Khi hết câu hỏi, Quiz Service gửi quiz.ended

Frontend hiển thị kết quả tổng kết

Ghi chú về Event Sourcing cho điểm số
Thay vì chỉ lưu score, có thể lưu danh sách câu trả lời + thứ tự trong player_scores hoặc bảng riêng.

Điểm sẽ được tính toán lại khi cần dựa trên lịch sử sự kiện (answer.submitted).