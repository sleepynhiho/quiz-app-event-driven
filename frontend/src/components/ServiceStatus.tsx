import React, { useState, useEffect } from 'react';
import { healthApi } from '../services/api';
import './ServiceStatus.css';

interface ServiceHealth {
  userService: boolean;
  quizService: boolean;
  answerService: boolean;
  scoringService: boolean;
}

const ServiceStatus: React.FC = () => {
  const [health, setHealth] = useState<ServiceHealth>({
    userService: false,
    quizService: false,
    answerService: false,
    scoringService: false
  });
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const results = await healthApi.checkAllServices();
      setHealth(results);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const ServiceIndicator: React.FC<{ name: string; status: boolean }> = ({ name, status }) => (
    <div className="service-indicator">
      <span className={`status-dot ${status ? 'online' : 'offline'}`}></span>
      <span className="service-name">{name}</span>
      <span className={`status-text ${status ? 'online' : 'offline'}`}>
        {status ? 'Online' : 'Offline'}
      </span>
    </div>
  );

  return (
    <div className="service-status">
      <div className="service-status-header">
        <h3>🏥 Service Health Status</h3>
        <button 
          onClick={checkHealth} 
          disabled={loading}
          className="refresh-btn"
        >
          {loading ? '🔄 Checking...' : '🔄 Refresh'}
        </button>
      </div>
      
      <div className="services-grid">
        <ServiceIndicator name="User Service (3000)" status={health.userService} />
        <ServiceIndicator name="Quiz Service (3001)" status={health.quizService} />
        <ServiceIndicator name="Answer Service (3002)" status={health.answerService} />
        <ServiceIndicator name="Scoring Service (3003)" status={health.scoringService} />
      </div>


    </div>
  );
};

export default ServiceStatus; 