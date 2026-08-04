import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-5xl font-black gradient-text mb-3">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The page you are searching for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all"
      >
        <HomeIcon className="w-5 h-5" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
