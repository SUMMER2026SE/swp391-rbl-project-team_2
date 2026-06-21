import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import './ThemeToggle.css';

const MODES = ['light', 'dark'];
const MODE_LABELS = { light: 'Light', dark: 'Dark' };

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Sanitize in case they had 'system' stored previously
    if (theme === 'system') {
      setTheme('dark');
      return;
    }

    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for changes from other tabs or settings
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'theme' && e.newValue) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const cycleTheme = () => {
    const currentIndex = MODES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % MODES.length;
    setTheme(MODES[nextIndex]);
  };

  const getIcon = () => {
    if (theme === 'dark') return <Sun size={20} />;
    return <Moon size={20} />;
  };

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={cycleTheme}
      title={`Theme: ${MODE_LABELS[theme]} — Click to switch`}
    >
      {getIcon()}
      <span className="theme-toggle-label">{MODE_LABELS[theme]}</span>
    </button>
  );
};

export default ThemeToggle;
