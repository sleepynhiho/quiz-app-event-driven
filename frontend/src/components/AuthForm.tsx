import React, { useState } from 'react';
import { authApi } from '../services/api';
import { User } from '../types';
import './AuthForm.css';

interface AuthFormProps {
  onAuthSuccess: (user: User, token: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Đăng nhập
        const response = await authApi.login({
          email: formData.email,
          password: formData.password
        });
        
        // Lưu token và thông tin user
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        onAuthSuccess(response.user, response.token);
      } else {
        // Đăng ký
        if (formData.password !== formData.confirmPassword) {
          setError('Mật khẩu xác nhận không khớp!');
          return;
        }

        const response = await authApi.register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });

        // Lưu token và thông tin user
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        onAuthSuccess(response.user, response.token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Demo credentials
  const useDemoCredentials = () => {
    setFormData({
      ...formData,
      email: 'demo@quiz.com',
      password: 'demo123'
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? '🔐 Đăng nhập' : '📝 Đăng ký'}</h2>
          <p>{isLogin ? 'Chào mừng bạn quay lại!' : 'Tạo tài khoản mới'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>👤 Tên người dùng</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên người dùng"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label>📧 Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>🔒 Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                required={!isLogin}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? '⏳ Đang xử lý...' : (isLogin ? '🚀 Đăng nhập' : '📝 Đăng ký')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="switch-btn"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="demo-section">
            <p className="demo-text">🧪 Thử nghiệm nhanh:</p>
            <button 
              type="button"
              onClick={useDemoCredentials}
              className="demo-btn"
            >
              Dùng tài khoản demo
            </button>
          </div>
        )}

        <div className="auth-note">
          <p>💡 <strong>Lưu ý:</strong> Tính năng này kết nối với User Service để xác thực người dùng và quản lý phiên đăng nhập.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 