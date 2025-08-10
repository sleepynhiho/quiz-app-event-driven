import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { answerApi, scoringApi } from '../services/api';
import { Answer, PlayerScore, SubmitAnswerRequest } from '../types';
import './AnswerTest.css';

const AnswerTest: React.FC = () => {
  const [formData, setFormData] = useState<SubmitAnswerRequest>({
    playerId: '550e8400-e29b-41d4-a716-446655440000',
    quizId: '550e8400-e29b-41d4-a716-446655440001',
    questionId: '',
    answer: ''
  });
  
  const [lastAnswer, setLastAnswer] = useState<Answer | null>(null);
  const [playerScore, setPlayerScore] = useState<PlayerScore | null>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNewQuestionId = () => {
    const newQuestionId = uuidv4();
    setFormData(prev => ({ ...prev, questionId: newQuestionId }));
  };

  const generateNewPlayerId = () => {
    const newPlayerId = uuidv4();
    setFormData(prev => ({ ...prev, playerId: newPlayerId }));
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Submit answer
      const answer = await answerApi.submitAnswer(formData);
      setLastAnswer(answer);

      // Wait a moment for Kafka event processing
      setTimeout(async () => {
        try {
          // Get updated player score
          const score = await scoringApi.getPlayerScore(formData.playerId, formData.quizId);
          setPlayerScore(score);

          // Get updated leaderboard
          const board = await scoringApi.getLeaderboard(formData.quizId);
          setLeaderboard(board);
        } catch (err) {
          console.error('Error fetching scores:', err);
        }
      }, 1000);

    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const board = await scoringApi.getLeaderboard(formData.quizId);
      setLeaderboard(board);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="answer-test">
      <h2>🧪 Answer & Scoring Test</h2>
      
      {/* Submit Answer Form */}
      <div className="test-section">
        <h3>Submit Answer</h3>
        <form onSubmit={handleSubmitAnswer} className="answer-form">
          <div className="form-group">
            <label>Player ID:</label>
            <div className="input-with-button">
              <input
                type="text"
                value={formData.playerId}
                onChange={(e) => setFormData({...formData, playerId: e.target.value})}
                placeholder="Player UUID"
                required
              />
              <button type="button" onClick={generateNewPlayerId}>New Player</button>
            </div>
          </div>

          <div className="form-group">
            <label>Quiz ID:</label>
            <input
              type="text"
              value={formData.quizId}
              onChange={(e) => setFormData({...formData, quizId: e.target.value})}
              placeholder="Quiz UUID"
              required
            />
          </div>

          <div className="form-group">
            <label>Question ID:</label>
            <div className="input-with-button">
              <input
                type="text"
                value={formData.questionId}
                onChange={(e) => setFormData({...formData, questionId: e.target.value})}
                placeholder="Question UUID"
                required
              />
              <button type="button" onClick={generateNewQuestionId}>New Question</button>
            </div>
          </div>

          <div className="form-group">
            <label>Answer:</label>
            <input
              type="text"
              value={formData.answer}
              onChange={(e) => setFormData({...formData, answer: e.target.value})}
              placeholder="Enter answer (starts with 'A' = correct)"
              required
            />
            <small>💡 Tip: Answers starting with 'A' are marked as correct (mock logic)</small>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Submitting...' : 'Submit Answer'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}
      </div>

      {/* Last Answer Result */}
      {lastAnswer && (
        <div className="test-section">
          <h3>Last Answer Submitted</h3>
          <div className={`answer-result ${lastAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
            <p><strong>Answer:</strong> {lastAnswer.answer}</p>
            <p><strong>Result:</strong> {lastAnswer.isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
            <p><strong>Submitted At:</strong> {new Date(lastAnswer.submittedAt).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Player Score */}
      {playerScore && (
        <div className="test-section">
          <h3>Player Score</h3>
          <div className="score-card">
            <div className="score-stat">
              <span className="score-label">Total Score:</span>
              <span className="score-value">{playerScore.totalScore}</span>
            </div>
            <div className="score-stat">
              <span className="score-label">Correct:</span>
              <span className="score-value">{playerScore.correctAnswers}</span>
            </div>
            <div className="score-stat">
              <span className="score-label">Total:</span>
              <span className="score-value">{playerScore.totalAnswers}</span>
            </div>
            <div className="score-stat">
              <span className="score-label">Accuracy:</span>
              <span className="score-value">
                {playerScore.totalAnswers > 0 
                  ? Math.round((playerScore.correctAnswers / playerScore.totalAnswers) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="test-section">
        <div className="section-header">
          <h3>🏆 Leaderboard</h3>
          <button onClick={fetchLeaderboard} disabled={loading}>
            Refresh Leaderboard
          </button>
        </div>
        
        {leaderboard.length > 0 ? (
          <div className="leaderboard">
            {leaderboard.map((player, index) => (
              <div key={player.id} className="leaderboard-item">
                <span className="rank">#{index + 1}</span>
                <span className="player-id">{player.playerId.substring(0, 8)}...</span>
                <span className="score">{player.totalScore} pts</span>
                <span className="accuracy">
                  {player.totalAnswers > 0 
                    ? Math.round((player.correctAnswers / player.totalAnswers) * 100) 
                    : 0}%
                </span>
                <span className="answers">{player.correctAnswers}/{player.totalAnswers}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No scores available yet</p>
        )}
      </div>


    </div>
  );
};

export default AnswerTest; 