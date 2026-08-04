import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Zap, Target, Loader2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { socket } from '../services/socket';

export const Leaderboard = () => {

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        if (res.success && res.events.length > 0) {
          setEvents(res.events);
          setSelectedEventId(res.events[0]._id);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/results/leaderboard/${selectedEventId}`);
        if (res.success) {
          setLeaderboard(res.leaderboard || []);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Socket.IO real-time event listener
    socket.emit('join_event', selectedEventId);

    const handleLeaderboardUpdate = () => {
      fetchLeaderboard();
    };

    socket.on('leaderboard_update', handleLeaderboardUpdate);
    socket.on('test_completed', handleLeaderboardUpdate);

    return () => {
      socket.off('leaderboard_update', handleLeaderboardUpdate);
      socket.off('test_completed', handleLeaderboardUpdate);
    };
  }, [selectedEventId]);


  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-400/30">
            🥇 1
          </span>
        );
      case 2:
        return (
          <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black flex items-center justify-center shadow-lg">
            🥈 2
          </span>
        );
      case 3:
        return (
          <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-black flex items-center justify-center shadow-lg">
            🥉 3
          </span>
        );
      default:
        return (
          <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold font-mono flex items-center justify-center">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Competition Leaderboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time rankings sorted by Net WPM, Accuracy, and Final Score.
          </p>
        </div>

        {events.length > 0 && (
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-4 py-2.5 rounded-xl glass-card border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title} ({ev.eventCode})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl glass-card border overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm text-slate-500">Updating live rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-bold">No Completed Results Yet</p>
            <p className="text-xs">Results will appear live as competitors finish typing tests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-4 text-center">Rank</th>
                  <th className="p-4">Participant Name</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Net WPM</th>
                  <th className="p-4">Accuracy</th>
                  <th className="p-4 text-right">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
                {leaderboard.map((res, index) => (
                  <tr
                    key={res._id}
                    className={`hover:bg-slate-500/5 transition-colors ${
                      index < 3 ? 'bg-purple-500/5 font-semibold' : ''
                    }`}
                  >
                    <td className="p-4 text-center flex justify-center">
                      {getRankBadge(index + 1)}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {res.studentId?.name || 'Anonymous'}
                    </td>
                    <td className="p-4 font-mono font-bold text-purple-400">
                      {res.studentId?.rollNumber || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {res.studentId?.department || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-indigo-400">
                      {res.netWpm} WPM
                    </td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">
                      {res.accuracy}%
                    </td>
                    <td className="p-4 text-right font-mono font-extrabold text-lg text-purple-400">
                      {res.finalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
