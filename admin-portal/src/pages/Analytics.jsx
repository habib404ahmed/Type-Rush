import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { BarChart3, Award, TrendingUp, Users, Loader2 } from 'lucide-react';
import api from '../services/api';

export const Analytics = () => {
  const [chartsData, setChartsData] = useState({
    departmentComparison: [],
    scoreDistribution: [],
    topPerformers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/charts');
        if (res.success && res.charts) {
          setChartsData(res.charts);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Analytics & Performance Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Visual charts for department comparisons, score distributions, and top performers.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm text-slate-500">Generating analytics charts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl glass-card border space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Department Speed Comparison</h3>
                <p className="text-xs text-slate-400">Average Net WPM by Department</p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.departmentComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="avgWpm" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Avg Net WPM" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Score Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl glass-card border space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Score Distribution</h3>
                <p className="text-xs text-slate-400">Participants grouped by score ranges</p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartsData.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                    name="Participants"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Performers Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl glass-card border space-y-4 shadow-xl lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Top 5 Competition Performers</h3>
                <p className="text-xs text-slate-400">Highest scoring participants overall</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.topPerformers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="score" fill="#ec4899" radius={[0, 8, 8, 0]} name="Final Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
