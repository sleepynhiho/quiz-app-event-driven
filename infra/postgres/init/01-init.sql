-- Quiz App database initialization
-- Creates core tables and indexes

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    code VARCHAR(6) UNIQUE NOT NULL,
    host_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_sessions table for tracking active quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
    current_question_index INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table for tracking quiz participants
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    user_id UUID,
    username VARCHAR(255),
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table for tracking participant answers
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_code ON quizzes(code);
CREATE INDEX IF NOT EXISTS idx_quizzes_host_id ON quizzes(host_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at);

CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz_id ON quiz_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status);

CREATE INDEX IF NOT EXISTS idx_participants_quiz_session_id ON participants(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);

CREATE INDEX IF NOT EXISTS idx_answers_participant_id ON answers(participant_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_answered_at ON answers(answered_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for quizzes table
CREATE TRIGGER update_quizzes_updated_at 
    BEFORE UPDATE ON quizzes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development (optional)
-- Uncomment the following lines if you want sample data

/*
-- Sample quiz
INSERT INTO quizzes (id, title, code, host_id) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Sample Quiz', 'ABC123', '550e8400-e29b-41d4-a716-446655440001');

-- Sample questions
INSERT INTO questions (id, content, options, correct_answer, quiz_id) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'What is 2 + 2?', '["2", "3", "4", "5"]', 2, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', 'What is the capital of France?', '["London", "Berlin", "Paris", "Madrid"]', 2, '550e8400-e29b-41d4-a716-446655440000');
*/

-- Create a view for quiz statistics
CREATE OR REPLACE VIEW quiz_stats AS
SELECT 
    q.id as quiz_id,
    q.title,
    q.code,
    q.host_id,
    COUNT(DISTINCT qs.id) as total_sessions,
    COUNT(DISTINCT p.id) as total_participants,
    COUNT(DISTINCT qu.id) as total_questions,
    q.created_at
FROM quizzes q
LEFT JOIN quiz_sessions qs ON q.id = qs.quiz_id
LEFT JOIN participants p ON qs.id = p.quiz_session_id
LEFT JOIN questions qu ON q.id = qu.quiz_id
GROUP BY q.id, q.title, q.code, q.host_id, q.created_at;

COMMIT;
