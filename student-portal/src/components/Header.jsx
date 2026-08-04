import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Zap, Activity } from 'lucide-react';
import api from '../services/api';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.get('/health');
        if (res.success) setApiConnected(true);
      } catch (err) {
        setApiConnected(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-200/50 dark:border-slate-800/80 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight gradient-text">
              Type Rush
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Student Arena
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold glass-card border border-slate-300/40 dark:border-slate-700/50"
            title={apiConnected ? 'Backend Connected' : 'Connecting to API...'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden sm:inline text-slate-600 dark:text-slate-300">
              {apiConnected ? 'API Online' : 'Connecting'}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass-card border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
