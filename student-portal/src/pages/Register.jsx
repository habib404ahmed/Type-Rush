import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Hash,
  GraduationCap,
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowRight,
  AlertCircle,
  Clock,
  Zap,
  Loader2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const codeParam = searchParams.get('code') || '';
  const [eventCode, setEventCode] = useState(codeParam);
  const [eventDetails, setEventDetails] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: 'B.Tech',
    confirmation: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch event details on mount if codeParam is available
  useEffect(() => {
    if (codeParam) {
      fetchEventInfo(codeParam);
    }
  }, [codeParam]);

  const fetchEventInfo = async (code) => {
    if (!code) return;
    setLoadingEvent(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/events/code/${code}`);
      if (res.success) {
        setEventDetails(res.event);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch event details');
    } finally {
      setLoadingEvent(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = formData.name.trim();
    const cleanRoll = formData.rollNumber.trim();
    const targetCode = (eventCode || codeParam).trim().toUpperCase();

    if (!cleanName) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!cleanRoll) {
      setErrorMsg('Please enter your roll number');
      return;
    }
    if (!targetCode) {
      setErrorMsg('Please enter a valid event code');
      return;
    }
    if (!formData.confirmation) {
      setErrorMsg('You must check the box to agree to anti-cheat terms');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/students/register', {
        name: cleanName,
        rollNumber: cleanRoll,
        department: formData.department,
        eventCode: targetCode,
        confirmation: formData.confirmation,
      });

      if (res.success && res.token) {
        // Save session state locally
        localStorage.setItem('typerush_student_token', res.token);
        localStorage.setItem('typerush_student_info', JSON.stringify(res.student));
        localStorage.setItem('typerush_event_info', JSON.stringify(res.event));

        // Navigate directly to typing arena lobby
        navigate('/arena');
      }
    } catch (err) {

      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center p-4 sm:p-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        {/* Event Header Banner */}
        {eventDetails ? (
          <div className="p-5 rounded-3xl glass-card border border-indigo-500/30 bg-indigo-500/5 space-y-2 text-center">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CODE: {eventDetails.eventCode}</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {eventDetails.title}
            </h2>
            <div className="flex items-center justify-center space-x-4 text-xs font-semibold text-slate-400 pt-1">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{eventDetails.duration} Seconds</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{eventDetails.difficulty}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
              Student Registration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Enter your student credentials to join the live typing competition.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center space-x-2.5"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl glass-card border space-y-4 shadow-2xl">
          {!eventDetails && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Event Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. TR8K29"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                  onBlur={() => fetchEventInfo(eventCode)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 font-mono font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Roll Number (Unique ID)
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. 21BCA104"
                value={formData.rollNumber}
                onChange={(e) =>
                  setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 font-mono font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Department
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="MBA">MBA</option>
              </select>
            </div>
          </div>

          <div
            onClick={() =>
              setFormData({ ...formData, confirmation: !formData.confirmation })
            }
            className="flex items-start space-x-3 pt-2 cursor-pointer select-none"
          >
            <div className="mt-0.5 text-indigo-500">
              {formData.confirmation ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <span className="text-xs text-slate-300 font-semibold leading-tight">
              I confirm these details are correct and agree to follow anti-cheat guidelines.
            </span>

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Continue to Typing Arena</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
