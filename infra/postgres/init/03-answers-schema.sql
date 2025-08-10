-- Answer Service Database Schema
-- Create answers table as specified in instruction.md

CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    question_id UUID NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answer VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_answers_player_id ON answers(player_id);
CREATE INDEX IF NOT EXISTS idx_answers_quiz_id ON answers(quiz_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_submitted_at ON answers(submitted_at);

-- Unique constraint to prevent duplicate answers per player per question
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_player_question 
ON answers(player_id, quiz_id, question_id); 