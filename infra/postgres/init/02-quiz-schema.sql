-- Quiz App Database Schema
-- Run this SQL script to create the database schema

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL,
    content TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Create quiz_players table
CREATE TABLE IF NOT EXISTS quiz_players (
    quiz_id UUID NOT NULL,
    player_id UUID NOT NULL,
    score INTEGER DEFAULT 0,
    PRIMARY KEY (quiz_id, player_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions("order");
CREATE INDEX IF NOT EXISTS idx_quiz_players_quiz_id ON quiz_players(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_players_player_id ON quiz_players(player_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_code ON quizzes(code);
CREATE INDEX IF NOT EXISTS idx_quizzes_host_id ON quizzes(host_id);
