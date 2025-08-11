-- Quiz App extended schema
-- Additional tables and modifications

-- Quizzes table (extends base schema)
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table (may exist from init script)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL,
    content TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Add order column for question sequencing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'order') THEN
        ALTER TABLE questions ADD COLUMN "order" INTEGER;
    END IF;
END $$;

-- Quiz players junction table
CREATE TABLE IF NOT EXISTS quiz_players (
    quiz_id UUID NOT NULL,
    player_id UUID NOT NULL,
    score INTEGER DEFAULT 0,
    PRIMARY KEY (quiz_id, player_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Player quiz joins for User Service
CREATE TABLE IF NOT EXISTS player_quiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, quiz_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
-- Order index (conditional)
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

-- Player quiz table indexes
CREATE INDEX IF NOT EXISTS idx_player_quiz_player_id ON player_quiz(player_id);
CREATE INDEX IF NOT EXISTS idx_player_quiz_quiz_id ON player_quiz(quiz_id);
CREATE INDEX IF NOT EXISTS idx_player_quiz_joined_at ON player_quiz(joined_at);
