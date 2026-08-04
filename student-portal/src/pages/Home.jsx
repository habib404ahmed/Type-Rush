import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Sparkles, Trophy, ShieldCheck, Keyboard, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const Home = () => {
  const [eventCode, setEventCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      navigate(`/register?code=${codeFromUrl.toUpperCase()}`);
    }
  }, [searchParams, navigate]);

  const handleJoin = async (e) => {
    e.preventDefault();
    const cleanCode = eventCode.trim().toUpperCase();
    if (!cleanCode) return;

    setLoading(true);
    try {
      const res = await api.get(`/events/code/${cleanCode}`);
      if (res.success) {
        navigate(`/register?code=${cleanCode}`);
      }
    } catch (err) {
      alert(err.message || 'Invalid Event Code');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="my-auto py-10 flex flex-col items-center text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 text-xs font-semibold shadow-inner"
        >
          <Sparkles className="w-4 h-4" />
          <span>Real-Time College Typing Championship</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight"
        >
          Unleash Your Typing Speed on <span className="gradient-text">Type Rush</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed"
        >
          Join live speed typing competitions, test your Net WPM & accuracy under pressure, and climb the real-time leaderboard!
        </motion.p>

        {/* Enter Code Box */}
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleJoin}
          className="w-full max-w-md p-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            placeholder="Enter Event Code (e.g. RUSH2026)"
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-slate-900 dark:text-white font-mono uppercase font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 dark:border-slate-800"
            maxLength={12}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>Enter</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.form>
      </div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8"
      >
        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Keyboard className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Precision Typing Engine</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time WPM, net accuracy calculations, and progress tracking with dynamic text blocks.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Anti-Cheat Shield</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Automated window blur, tab-switch monitoring, and anti-paste protection for fair competitions.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Instant Live Leaderboard</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Watch rankings shift in real time via Socket.IO connections as competitors finish their tests.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
