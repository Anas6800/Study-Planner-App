import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title="Toggle theme"
    >
      <span className="theme-icon">
        🌙
      </span>
    </button>
  );
};

export default ThemeToggle;
