import React from 'react';

export const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl glass-card border space-y-3 bg-slate-900/40"
        >
          <div className="h-4 bg-slate-800 rounded w-1/3"></div>
          <div className="h-6 bg-slate-800 rounded w-2/3"></div>
          <div className="h-3 bg-slate-800 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};
