import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import api from '../services/api';

export const Participants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      let queryStr = `/dashboard/participants?department=${selectedDept}`;
      if (searchTerm) queryStr += `&search=${searchTerm}`;
      const res = await api.get(queryStr);
      if (res.success) {
        setParticipants(res.participants || []);
      }
    } catch (err) {
      console.error('Participants error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [selectedDept]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParticipants();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Participants Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered students, department breakdown, and attempt statuses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl glass-card border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </form>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3.5 py-2 rounded-xl glass-card border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Departments</option>
            <option value="B.Tech">B.Tech</option>
            <option value="BCA">BCA</option>
            <option value="BBA">BBA</option>
            <option value="MBA">MBA</option>
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="rounded-2xl glass-card border overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading participants...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-bold">No participants found</p>
            <p className="text-xs">Try adjusting department filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Event Code</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Registration Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
                {participants.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {st.name}
                    </td>
                    <td className="p-4 font-mono font-bold text-purple-400">
                      {st.rollNumber}
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {st.department}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {st.eventId?.eventCode || 'N/A'}
                    </td>
                    <td className="p-4">
                      {st.hasAttempted ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {new Date(st.createdAt).toLocaleString()}
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
