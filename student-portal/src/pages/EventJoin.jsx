import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  RefreshCw,
  Home as HomeIcon,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

export const EventJoin = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);

  const checkEvent = async () => {
    if (!eventCode) return;
    setLoading(true);
    setErrorStatus(null);
    try {
      const res = await api.get(`/events/code/${eventCode.toUpperCase()}`);
      if (res.success && res.event) {
        const ev = res.event;
        setEvent(ev);

        const status = (ev.status || '').toLowerCase();
        if (status === 'active') {
          navigate(`/register?code=${ev.eventCode}`);
        }
      }
    } catch (err) {
      console.warn('[Event Join Warning]:', err.message);
      setErrorStatus(404);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEvent();
  }, [eventCode]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <h2 className="text-lg font-bold text-slate-300">Verifying Event Code...</h2>
      </div>
    );
  }

  // 404 Event Not Found Page
  if (errorStatus === 404 || !event) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl glass-card border border-rose-500/30 space-y-5 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-black gradient-text">404</h1>
            <h2 className="text-xl font-bold">Event Not Found</h2>
            <p className="text-xs text-slate-400 font-mono pt-1">
              CODE: {eventCode?.toUpperCase()}
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The competition event code you scanned or entered does not exist or has been removed. Please check the code and try again.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition-all"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Return to Type Rush Home</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const normStatus = (event.status || '').toLowerCase();

  // Upcoming Event Page
  if (normStatus === 'upcoming' || normStatus === 'scheduled' || normStatus === 'draft') {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl glass-card border border-amber-500/30 space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
              UPCOMING COMPETITION
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">{event.title}</h2>
            <p className="text-xs font-mono text-purple-400">CODE: {event.eventCode}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
            <p className="font-bold text-amber-400 text-sm">This competition has not started yet.</p>
            <p className="text-slate-400">
              The administrator has scheduled this event. Please wait for the event to go live.
            </p>
          </div>

          <button
            onClick={checkEvent}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Status Again</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // Ended Event Page
  if (normStatus === 'ended' || normStatus === 'completed' || normStatus === 'cancelled') {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl glass-card border border-slate-700/50 space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-400 font-mono text-xs font-bold border border-slate-700">
              COMPETITION ENDED
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">{event.title}</h2>
            <p className="text-xs font-mono text-slate-400">CODE: {event.eventCode}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-400">
            <p className="font-bold text-slate-300 text-sm">This competition has ended.</p>
            <p>
              Submissions for this typing competition are closed.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 text-center">
      <Link
        to={`/register?code=${event.eventCode}`}
        className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm"
      >
        Proceed to Registration
      </Link>
    </div>
  );
};
