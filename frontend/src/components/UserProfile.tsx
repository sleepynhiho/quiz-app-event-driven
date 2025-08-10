import React from 'react';
import { User } from '../types';
import './UserProfile.css';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  return (
    <div className="user-profile">
      <div className="profile-info">
        <div className="avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="user-details">
          <h3>👋 Xin chào, {user.username}!</h3>
          <p>📧 {user.email}</p>
        </div>
      </div>
      
      <button onClick={onLogout} className="logout-btn">
        🚪 Đăng xuất
      </button>
    </div>
  );
};

export default UserProfile; 