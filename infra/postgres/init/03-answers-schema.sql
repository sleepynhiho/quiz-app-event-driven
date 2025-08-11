-- Answer Service schema
-- Stores player answer submissions

CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    question_id UUID NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answer VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);

-- Answer table indexes
CREATE INDEX IF NOT EXISTS idx_answers_player_id ON answers(player_id);
CREATE INDEX IF NOT EXISTS idx_answers_quiz_id ON answers(quiz_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_submitted_at ON answers(submitted_at);

-- Prevent duplicate submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_player_question 
ON answers(player_id, quiz_id, question_id);

-- Scoring Service table
CREATE TABLE IF NOT EXISTS player_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    score INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, quiz_id)
);

-- Player scores indexes
CREATE INDEX IF NOT EXISTS idx_player_scores_player_id ON player_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_player_scores_quiz_id ON player_scores(quiz_id);
CREATE INDEX IF NOT EXISTS idx_player_scores_score ON player_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_player_scores_updated_at ON player_scores(updated_at); 