import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Logout: React.FC = () => {
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="logout-container">
      <div className="flex flex-col items-center gap-2">
        <p className="logout-text">
          👋 {currentUser?.email?.split('@')[0]}
        </p>
        <button
          onClick={handleLogout}
          className="logout-button"
          title="Sign out"
        >
          <span className="mr-1">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Logout;
