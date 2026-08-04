import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileJson, Printer, Loader2 } from 'lucide-react';
import api from '../services/api';

export const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExportData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/export');
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching export data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExportData();
  }, []);

  const exportToCsv = () => {
    if (reportData.length === 0) return;

    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TypeRush_Full_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJson = () => {
    if (reportData.length === 0) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `TypeRush_Full_Report_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Reports & Export Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Export full competition results to CSV spreadsheet or JSON format.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportToJson}
            disabled={reportData.length === 0}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-card border border-purple-500/30 text-purple-400 font-bold text-xs hover:bg-purple-500/10 transition-all disabled:opacity-50"
          >
            <FileJson className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={exportToCsv}
            disabled={reportData.length === 0}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Reports Preview Table */}
      <div className="rounded-2xl glass-card border overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm text-slate-500">Preparing report export payload...</p>
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Download className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-bold">No Exportable Results Available</p>
            <p className="text-xs">Results will appear here once participants complete their typing tests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-4">Rank</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Event Code</th>
                  <th className="p-4">Net WPM</th>
                  <th className="p-4">Accuracy</th>
                  <th className="p-4">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
                {reportData.map((row) => (
                  <tr key={row.Rank + row.RollNumber} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">
                      #{row.Rank}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {row.StudentName}
                    </td>
                    <td className="p-4 font-mono font-bold text-purple-400">
                      {row.RollNumber}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-300">
                      {row.Department}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {row.EventCode}
                    </td>
                    <td className="p-4 font-mono font-bold text-indigo-400">
                      {row.NetWPM} WPM
                    </td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">
                      {row.AccuracyPercent}%
                    </td>
                    <td className="p-4 font-mono font-extrabold text-purple-400">
                      {row.FinalScore}
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
