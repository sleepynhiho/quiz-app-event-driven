import React, { useState, useEffect } from 'react';
import ServiceStatus from './components/ServiceStatus';
import SimpleQuizTest from './components/SimpleQuizTest';
import AuthForm from './components/AuthForm';
import UserProfile from './components/UserProfile';
import QuizCreator from './components/QuizCreator';
import { User } from './types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'quiz' | 'creator'>('quiz');

  // Check for saved auth on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setAuthToken(savedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleAuthSuccess = (newUser: User, token: string) => {
    setUser(newUser);
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Clear any quiz-related data
    localStorage.removeItem('quizState');
    localStorage.removeItem('currentQuiz');
    setUser(null);
    setAuthToken(null);
  };

  const handleQuizCreated = (quiz: any) => {
    alert(`✅ Quiz "${quiz.title}" đã được tạo thành công!`);
    setCurrentView('quiz'); // Switch back to quiz view
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 Quiz App - Event-Driven System</h1>
        <p>{user ? `Chào mừng bạn đến với hệ thống Quiz!` : 'Đăng nhập để bắt đầu chơi quiz'}</p>
      </header>

      <main className="App-main">
        <ServiceStatus />
        
        {!user ? (
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            <UserProfile user={user} onLogout={handleLogout} />
            
            {/* View Switcher */}
            <div className="view-switcher">
              <button 
                onClick={() => setCurrentView('quiz')}
                className={`view-btn ${currentView === 'quiz' ? 'active' : ''}`}
              >
                🎮 Chơi Quiz
              </button>
              <button 
                onClick={() => setCurrentView('creator')}
                className={`view-btn ${currentView === 'creator' ? 'active' : ''}`}
              >
                🎯 Tạo Quiz
              </button>
            </div>

            {/* Content based on current view */}
                            {currentView === 'quiz' ? (
                  <SimpleQuizTest user={user} />
                ) : (
                  <QuizCreator user={user} onQuizCreated={handleQuizCreated} />
                )}
          </>
        )}
      </main>

      <footer className="App-footer">
        <p>
          Services: Answer Service (3002) ↔ Kafka ↔ Scoring Service (3003)
        </p>
        <p>
          Event Flow: Submit Answer → Kafka Events → Real-time Scoring
        </p>
      </footer>
    </div>
  );
}

export default App;
