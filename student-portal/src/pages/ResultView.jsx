import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Zap,
  Target,
  AlertCircle,
  Award,
  CheckCircle,
  XCircle,
  Home,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ResultView = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const storedResult = localStorage.getItem('typerush_last_result');
    const storedStudent = localStorage.getItem('typerush_student_info');

    if (storedResult) {
      const parsedResult = JSON.parse(storedResult);
      setResult(parsedResult);

      // Trigger confetti celebration if not disqualified and good accuracy
      if (!parsedResult.disqualified && parsedResult.accuracy >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }

    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">No Test Results Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          Please register for an active competition event and complete your typing test.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center space-y-6"
      >
        {/* Disqualification Banner */}
        {result.disqualified ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center justify-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>Attempt Disqualified due to Anti-Cheat Security Violations (3 Warnings Exceeded).</span>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-inner">
            <CheckCircle className="w-4 h-4" />
            <span>Test Submitted Successfully</span>
          </div>
        )}

        {/* Big Score Card */}
        <div className="p-8 rounded-3xl glass-card border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent shadow-2xl relative overflow-hidden space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Final Competition Score
            </span>
            <h1 className="text-6xl sm:text-7xl font-black font-mono gradient-text">
              {result.finalScore || 0}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Score = (Net WPM × 10) + Accuracy - (Mistakes × 5)
            </p>
          </div>

          {result.rank && (
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 font-bold text-sm border border-purple-500/20">
              <Award className="w-4 h-4" />
              <span>Event Rank: #{result.rank}</span>
            </div>
          )}
        </div>

        {/* Key Metrics Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl glass-card text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Net WPM
            </span>
            <span className="text-3xl font-black font-mono text-indigo-400">
              {result.netWpm}
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Gross WPM
            </span>
            <span className="text-3xl font-black font-mono text-cyan-400">
              {result.grossWpm}
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Accuracy
            </span>
            <span className="text-3xl font-black font-mono text-emerald-400">
              {result.accuracy}%
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Mistakes
            </span>
            <span className="text-3xl font-black font-mono text-rose-400">
              {result.mistakes}
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Correct Chars
            </span>
            <span className="text-3xl font-black font-mono text-teal-400">
              {result.correctChars}
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Warnings
            </span>
            <span className="text-3xl font-black font-mono text-amber-400">
              {result.warningsCount || 0}/3
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Return to Arena Home</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
