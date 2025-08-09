-- Quiz App Database Schema
-- Run this SQL script to create the database schema

-- Create quizzes table (if not exists from previous initialization)
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table (if not exists from previous initialization)
-- Note: This may already exist from 01-init.sql, so we only add missing columns
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL,
    content TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Add order column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'order') THEN
        ALTER TABLE questions ADD COLUMN "order" INTEGER;
    END IF;
END $$;

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
-- Only create order index if column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'questions' AND column_name = 'order') THEN
        CREATE INDEX IF NOT EXISTS idx_questions_order ON questions("order");
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quiz_players_quiz_id ON quiz_players(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_players_player_id ON quiz_players(player_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_code ON quizzes(code);
CREATE INDEX IF NOT EXISTS idx_quizzes_host_id ON quizzes(host_id);
