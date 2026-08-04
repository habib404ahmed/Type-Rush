import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, ShieldCheck, Zap, Sliders, CheckCircle } from 'lucide-react';

export const Settings = () => {
  const [defaultDuration, setDefaultDuration] = useState(
    () => localStorage.getItem('typerush_pref_duration') || '60'
  );
  const [defaultDifficulty, setDefaultDifficulty] = useState(
    () => localStorage.getItem('typerush_pref_difficulty') || 'Medium'
  );
  const [strictAntiCheat, setStrictAntiCheat] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('typerush_pref_duration', defaultDuration);
    localStorage.setItem('typerush_pref_difficulty', defaultDifficulty);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          System Settings & Preferences
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure default event parameters, security strictness, and system defaults.
        </p>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>System preferences updated and saved successfully!</span>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-3xl glass-card border space-y-6 shadow-xl">
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center space-x-2 border-b border-slate-200/50 dark:border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-purple-400" />
            <span>Event Competition Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Default Test Duration
              </label>
              <select
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="30">30 Seconds</option>
                <option value="60">60 Seconds (1 Min)</option>
                <option value="90">90 Seconds</option>
                <option value="120">120 Seconds (2 Mins)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Default Difficulty Level
              </label>
              <select
                value={defaultDifficulty}
                onChange={(e) => setDefaultDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Random">Random</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Anti-Cheat Security Level</span>
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div>
              <h4 className="font-bold text-sm">Enforce 3-Warning Auto Disqualification</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically submit and flag tests when participants exceed 3 tab switches or focus violations.
              </p>
            </div>
            <input
              type="checkbox"
              checked={strictAntiCheat}
              onChange={(e) => setStrictAntiCheat(e.target.checked)}
              className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-sm text-white flex items-center space-x-2 shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save System Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
