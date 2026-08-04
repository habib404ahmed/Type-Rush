import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, ShieldCheck, User } from 'lucide-react';
import api from '../services/api';

export const AdminHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { admin, logout } = useAuth();
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
    <header className="sticky top-0 z-30 w-full glass-card border-b border-slate-200/50 dark:border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight gradient-text">
              Type Rush Admin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Command Center
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
              {apiConnected ? 'API Connected' : 'Connecting'}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl glass-card border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {admin && (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {admin.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {admin.role || 'Administrator'}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
