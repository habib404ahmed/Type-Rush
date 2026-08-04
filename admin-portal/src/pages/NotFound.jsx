import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-5xl font-black gradient-text mb-3">404</h1>
      <h2 className="text-2xl font-bold mb-2">Admin Section Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The requested administrative path does not exist or requires elevated permissions.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
