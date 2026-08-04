import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export const LoadingScreen = ({ message = 'Loading Type Rush...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white">
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/50 mb-6"
      >
        <Zap className="w-10 h-10 text-white" />
      </motion.div>
      
      <h2 className="text-xl font-bold tracking-wide gradient-text mb-2">
        Type Rush
      </h2>
      <p className="text-sm text-slate-400 font-medium">{message}</p>
      
      <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
};
