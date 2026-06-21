import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import AIChatWidget from './components/common/AIChatWidget';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    let activeTheme = savedTheme;
    if (savedTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = systemDark ? 'dark' : 'light';
    }
    
    if (activeTheme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, []);

  return (
    <div className="app-container">
      <Toaster position="top-center" />
      <AppRoutes />
      <AIChatWidget />
    </div>
  );
}

export default App;
