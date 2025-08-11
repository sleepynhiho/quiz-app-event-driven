import React, { useState, useEffect } from 'react';
import { answerApi, scoringApi, quizApi } from '../services/api';
import { Answer, PlayerScore, User, Question, QuizWithQuestions, Quiz } from '../types';
import websocketService from '../services/websocket';
import './SimpleQuizTest.css';

interface SimpleQuizTestProps {
  user: User;
}

const SimpleQuizTest: React.FC<SimpleQuizTestProps> = ({ user }) => {
  const [currentPlayer, setCurrentPlayer] = useState(user.id);
  const [answer, setAnswer] = useState('');
  const [lastResult, setLastResult] = useState<Answer | null>(null);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Quiz data from API
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  
  // Quiz selection
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('demo');
  const [showQuizSelector, setShowQuizSelector] = useState(false);
  
  // Quiz settings
  const [showSettings, setShowSettings] = useState(false);
  const [questionLimit, setQuestionLimit] = useState<number | undefined>(undefined);
  const [randomize, setRandomize] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Load available quizzes and setup WebSocket on mount
  useEffect(() => {
    loadAvailableQuizzes();
    
    // Initialize WebSocket connection
    websocketService.connect();
    
    // Define event handlers
    const handleQuizStarted = (data: any) => {
      console.log('Quiz started:', data);
      alert('Quiz has started!');
    };

    const handleQuestionPresented = (data: any) => {
      console.log('New question presented:', data);
      // Show alert for current quiz
      if (data.quizId === quiz?.id) {
        alert(`New question: ${data.content}`);
      }
    };

    const handleTimeUp = (data: any) => {
      console.log('Time up for question:', data);
      if (data.quizId === quiz?.id && data.questionId === currentQuestion?.id) {
        alert('Time is up for this question!');
        setAnswer(''); // Reset answer input
      }
    };

    const handleScoreUpdated = (data: any) => {
      console.log('Score updated:', data);
      // Update leaderboard
      if (data.quizId === quiz?.id) {
        loadScores();
      }
    };

    const handlePlayerJoined = (data: any) => {
      console.log('Player joined:', data);
      if (data.quizId === quiz?.id) {
        // Optional: show join notification
      }
    };

    const handleQuizEnded = (data: any) => {
      console.log('Quiz ended:', data);
      if (data.quizId === quiz?.id) {
        alert('Quiz has ended! Check the final results.');
        loadScores(); // Show final leaderboard
      }
    };

    // Register event listeners
    websocketService.on('quiz.started', handleQuizStarted);
    websocketService.on('question.presented', handleQuestionPresented);
    websocketService.on('time.up', handleTimeUp);
    websocketService.on('score.updated', handleScoreUpdated);
    websocketService.on('player.joined', handlePlayerJoined);
    websocketService.on('quiz.ended', handleQuizEnded);

    // Cleanup listeners on unmount
    return () => {
      websocketService.off('quiz.started', handleQuizStarted);
      websocketService.off('question.presented', handleQuestionPresented);
      websocketService.off('time.up', handleTimeUp);
      websocketService.off('score.updated', handleScoreUpdated);
      websocketService.off('player.joined', handlePlayerJoined);
      websocketService.off('quiz.ended', handleQuizEnded);
      websocketService.disconnect();
    };
  }, []);

  // Load quiz data when user or selection changes
  useEffect(() => {
    const initQuiz = async () => {
      if (selectedQuizId === 'demo') {
        await loadDemoQuiz();
      } else {
        await loadSelectedQuiz(selectedQuizId);
      }
      // Reset component state
      setCurrentQuestionIndex(0);
      setAnswer('');
      setLastResult(null);
      setStep(1);
      setScores([]);
    };
    initQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, selectedQuizId, questionLimit, randomize]);

  // Join quiz room for real-time updates
  useEffect(() => {
    if (quiz?.id && websocketService.isConnected()) {
      websocketService.joinQuiz(quiz.id, currentPlayer);
    }
  }, [quiz?.id, currentPlayer]);

  const loadAvailableQuizzes = async () => {
    try {
      const quizzes = await quizApi.getAllQuizzes();
      setAvailableQuizzes(quizzes);
    } catch (error) {
      console.error('Error loading available quizzes:', error);
    }
  };

  const loadScores = async () => {
    if (!quiz?.id) return;
    
    try {
      const leaderboard = await scoringApi.getLeaderboard(quiz.id);
      setScores(leaderboard);
    } catch (error) {
      console.error('Error loading scores:', error);
    }
  };

  const loadSelectedQuiz = async (quizId: string) => {
    setLoadingQuiz(true);
    try {
      console.log('Loading quiz:', quizId);
      const quizData = await quizApi.getQuiz(quizId);
      console.log('Quiz data received:', quizData);
      console.log('Questions:', quizData.questions);
      setQuiz(quizData);
      setQuestions(quizData.questions.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading selected quiz:', error);
      // Fallback to demo quiz
      await loadDemoQuiz();
    } finally {
      setLoadingQuiz(false);
    }
  };

  const loadDemoQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const quizData = await quizApi.getDemoQuiz(questionLimit, randomize);
      setQuiz(quizData);
      setQuestions(quizData.questions.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading quiz:', error);
      // Fallback to empty quiz
      setQuestions([]);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert('Vui lòng chọn câu trả lời!');
      return;
    }

    setLoading(true);
    try {
      // Submit answer
      const result = await answerApi.submitAnswer({
        playerId: currentPlayer,
        quizId: quiz?.id || '550e8400-e29b-41d4-a716-446655440001',
        questionId: currentQuestion.id,
        answer: answer
      });

      setLastResult(result);
      setStep(2);

      // Fetch updated scores after a delay
      setTimeout(async () => {
        try {
          const leaderboard = await scoringApi.getLeaderboard(quiz?.id || '550e8400-e29b-41d4-a716-446655440001');
          setScores(leaderboard);
          setStep(3);
        } catch (error) {
          console.error('Error fetching scores:', error);
        }
      }, 1500);

    } catch (error: any) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      setLastResult(null);
      setStep(1);
    } else {
      alert('Đã hết câu hỏi! Xem kết quả cuối cùng.');
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswer('');
    setLastResult(null);
    setStep(1);
    setScores([]);
    setCurrentPlayer(user.id);
    // Reload quiz to get fresh question IDs
    loadDemoQuiz();
  };

  return (
    <div className="simple-quiz">
      <div className="quiz-header">
        <h1>🎯 {quiz?.title || 'Quiz Test - Đơn giản & Dễ hiểu'}</h1>
        <div className="player-info">
          <span>👤 Người chơi: <strong>{user.username}</strong></span>
          <span>📝 Quiz Code: <strong>{quiz?.code || 'LOADING...'}</strong></span>
          <button onClick={() => setShowQuizSelector(!showQuizSelector)} className="settings-btn">
            📋 Chọn Quiz
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
            ⚙️ Cài đặt
          </button>
          <button onClick={resetQuiz} className="reset-btn">🔄 Chơi lại</button>
        </div>
      </div>

      {/* Quiz Selector */}
      {showQuizSelector && (
        <div className="quiz-selector">
          <h3>📋 Chọn Quiz để chơi</h3>
          <div className="quiz-options">
            <label className={`quiz-option ${selectedQuizId === 'demo' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="quiz"
                value="demo"
                checked={selectedQuizId === 'demo'}
                onChange={(e) => setSelectedQuizId(e.target.value)}
              />
              <div className="quiz-info">
                <strong>🎮 Demo Quiz</strong>
                <span>Quiz demo với 8 câu hỏi mẫu</span>
              </div>
            </label>
            
            {availableQuizzes.map((availableQuiz) => (
              <label key={availableQuiz.id} className={`quiz-option ${selectedQuizId === availableQuiz.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="quiz"
                  value={availableQuiz.id}
                  checked={selectedQuizId === availableQuiz.id}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                />
                <div className="quiz-info">
                  <strong>🎯 {availableQuiz.title}</strong>
                  <span>Code: {availableQuiz.code} • {(availableQuiz as any).questionsCount || 0} câu hỏi</span>
                  <small>Tạo lúc: {new Date(availableQuiz.createdAt).toLocaleString('vi-VN')}</small>
                </div>
              </label>
            ))}
          </div>
          
          {availableQuizzes.length === 0 && (
            <p className="no-quizzes">Chưa có quiz nào được tạo. Hãy tạo quiz mới trong tab "Tạo Quiz"!</p>
          )}
          
          <button onClick={() => setShowQuizSelector(false)} className="apply-settings-btn">
            ✅ Đóng
          </button>
        </div>
      )}

      {/* Quiz Settings */}
      {showSettings && (
        <div className="quiz-settings">
          <h3>⚙️ Cài đặt Quiz</h3>
          <div className="setting-group">
            <label>
              📊 Số câu hỏi:
              <select 
                value={questionLimit || ''} 
                onChange={(e) => setQuestionLimit(e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Tất cả (8 câu)</option>
                <option value="3">3 câu</option>
                <option value="5">5 câu</option>
                <option value="7">7 câu</option>
              </select>
            </label>
          </div>
          <div className="setting-group">
            <label>
              <input 
                type="checkbox" 
                checked={randomize} 
                onChange={(e) => setRandomize(e.target.checked)} 
              />
              🔀 Xáo trộn câu hỏi
            </label>
          </div>
          <button onClick={() => { loadDemoQuiz(); setShowSettings(false); }} className="apply-settings-btn">
            ✅ Áp dụng & Tải lại Quiz
          </button>
        </div>
      )}

      {/* Loading Quiz */}
      {loadingQuiz ? (
        <div className="loading-section">
          <h2>⏳ Đang tải câu hỏi từ Quiz Service...</h2>
          <p>Đang kết nối với backend để lấy dữ liệu quiz...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="error-section">
          <h2>❌ Không thể tải câu hỏi</h2>
          <p>Quiz Service có thể đang offline. Vui lòng thử lại sau.</p>
          <button onClick={loadDemoQuiz} className="retry-btn">🔄 Thử lại</button>
        </div>
      ) : (
        <>
          {/* Step 1: Question */}
          {step >= 1 && (
            <div className="question-section">
              <div className="question-header">
                <h2>Câu {currentQuestionIndex + 1}/{questions.length}</h2>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`}}
                  ></div>
                </div>
              </div>

              <div className="question-content">
                <h3>{currentQuestion.content}</h3>
                <div className="answer-options">
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className={`option ${answer === option ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={answer === option}
                        onChange={(e) => setAnswer(e.target.value)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {step === 1 && (
                  <button 
                    onClick={submitAnswer} 
                    disabled={loading || !answer} 
                    className="submit-btn"
                  >
                    {loading ? '⏳ Đang gửi...' : '📤 Gửi câu trả lời'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Result */}
          {step >= 2 && lastResult && (
            <div className={`result-section ${lastResult.isCorrect ? 'correct' : 'incorrect'}`}>
              <h3>📊 Kết quả câu trả lời</h3>
              <div className="result-content">
                <div className="result-icon">
                  {lastResult.isCorrect ? '✅' : '❌'}
                </div>
                <div className="result-text">
                  <p><strong>Câu trả lời của bạn:</strong> {lastResult.answer}</p>
                  <p><strong>Kết quả:</strong> {lastResult.isCorrect ? 'Chính xác!' : 'Sai rồi!'}</p>
                  {!lastResult.isCorrect && (
                    <p><strong>Đáp án đúng:</strong> {currentQuestion.options[currentQuestion.correctAnswer]}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Scores */}
          {step >= 3 && (
            <div className="scores-section">
              <h3>🏆 Bảng điểm Real-time</h3>
              {loading && <p className="loading">⏳ Đang tải điểm...</p>}
              
              {scores.length > 0 ? (
                <div className="leaderboard">
                  {scores.map((player, index) => (
                    <div key={player.id} className={`score-item ${player.playerId === currentPlayer ? 'current-player' : ''}`}>
                      <span className="rank">#{index + 1}</span>
                      <span className="player">
                        {player.playerId === currentPlayer ? `👤 ${user.username}` : `👥 ${player.playerId.slice(0, 8)}`}
                      </span>
                      <span className="score">{player.totalScore} điểm</span>
                      <span className="accuracy">
                        {player.totalAnswers > 0 ? Math.round((player.correctAnswers / player.totalAnswers) * 100) : 0}% đúng
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-scores">Chưa có điểm số. Thử gửi câu trả lời!</p>
              )}

              <div className="next-actions">
                {currentQuestionIndex < questions.length - 1 ? (
                  <button onClick={nextQuestion} className="next-btn">
                    ➡️ Câu tiếp theo
                  </button>
                ) : (
                  <button onClick={resetQuiz} className="finish-btn">
                    🎉 Hoàn thành - Chơi lại
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h4>📋 Hướng dẫn:</h4>
        <ol>
          <li>Đọc câu hỏi và chọn đáp án bằng cách click vào ô tròn</li>
          <li>Click "Gửi câu trả lời" để submit</li>
          <li>Xem kết quả ngay lập tức (đúng/sai)</li>
          <li>Xem điểm số được cập nhật real-time</li>
          <li>Chuyển sang câu tiếp theo hoặc chơi lại</li>
        </ol>
      </div>
    </div>
  );
};

export default SimpleQuizTest; 