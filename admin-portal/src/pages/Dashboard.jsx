import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Users,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Award,
  Loader2,
  Copy,
  Download,
  Printer,
  RefreshCw,
  Play,
  Check,
  QrCode,
  X,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { socket } from '../services/socket';

export const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    totalParticipants: 0,
    completed: 0,
    pending: 0,
    highestWpm: 0,
    avgWpm: 0,
    avgAccuracy: 0,
  });
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [refreshingQr, setRefreshingQr] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activeRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/events/active'),
      ]);

      if (statsRes.success && statsRes.stats) {
        setStatsData(statsRes.stats);
      }

      if (activeRes.success && activeRes.event) {
        setActiveEvent(activeRes.event);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshActiveEvent = async () => {
    setRefreshingQr(true);
    try {
      const activeRes = await api.get('/events/active');
      if (activeRes.success && activeRes.event) {
        setActiveEvent(activeRes.event);
      }
    } catch (err) {
      console.error('Refresh active event error:', err);
    } finally {
      setTimeout(() => setRefreshingQr(false), 500);
    }
  };

  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts((prev) => [{ id, type, title, message }, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  useEffect(() => {
    fetchDashboardData();

    // Socket.IO listeners
    socket.on('new_registration', (data) => {
      addToast(
        'info',
        'New Participant Registered! 🎓',
        `${data.name} (${data.department}) joined the competition.`
      );
      fetchDashboardData();
    });

    socket.on('test_completed', (data) => {
      addToast(
        'success',
        'Typing Test Completed! ⚡',
        `${data.studentName} finished with ${data.netWpm} WPM (${data.accuracy}% accuracy) - Rank #${data.rank}`
      );
      fetchDashboardData();
    });

    socket.on('anti_cheat_alert', (data) => {
      addToast(
        'warning',
        'Anti-Cheat Warning Alert ⚠️',
        `Violation warning #${data.warningCount}: ${data.reason}`
      );
    });

    socket.on('active_event_changed', () => {
      fetchDashboardData();
    });

    return () => {
      socket.off('new_registration');
      socket.off('test_completed');
      socket.off('anti_cheat_alert');
      socket.off('active_event_changed');
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1-Click PNG Download
  const downloadQrPng = () => {
    if (!activeEvent) return;
    const canvas = document.getElementById('dashboard-qr-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `TypeRush_QR_${activeEvent.eventCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Copy Student Link with Toast
  const copyJoinUrl = () => {
    if (!activeEvent) return;
    navigator.clipboard.writeText(activeEvent.joinUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Print QR Code View
  const printQrCode = () => {
    if (!activeEvent) return;
    const canvas = document.getElementById('dashboard-qr-canvas');
    if (!canvas) return;
    const qrDataUrl = canvas.toDataURL('image/png');

    const printWindow = window.open('', '_blank', 'width=650,height=750');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${activeEvent.title}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center;
              padding: 40px;
              color: #0f172a;
              background-color: #f8fafc;
            }
            .card {
              border: 3px solid #6366f1;
              border-radius: 24px;
              padding: 36px;
              max-width: 440px;
              margin: 0 auto;
              background: #ffffff;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            }
            .header-badge {
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 1px;
              color: #4f46e5;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            h1 { font-size: 26px; margin: 0 0 12px 0; color: #1e1b4b; line-height: 1.2; }
            .code-pill {
              font-family: 'Courier New', Courier, monospace;
              font-size: 22px;
              font-weight: bold;
              background: #e0e7ff;
              color: #3730a3;
              padding: 6px 18px;
              border-radius: 12px;
              display: inline-block;
              margin-bottom: 20px;
            }
            .qr-wrapper {
              background: #ffffff;
              padding: 16px;
              border-radius: 20px;
              display: inline-block;
              border: 2px solid #e2e8f0;
            }
            img { width: 260px; height: 260px; display: block; }
            .instruction { font-size: 13px; font-weight: 600; color: #475569; margin-top: 20px; }
            .url { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #6366f1; word-break: break-all; margin-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header-badge">College Championship • Type Rush</div>
            <h1>${activeEvent.title}</h1>
            <div class="code-pill">EVENT CODE: ${activeEvent.eventCode}</div>
            <br />
            <div class="qr-wrapper">
              <img src="${qrDataUrl}" alt="Student Registration QR Code" />
            </div>
            <div class="instruction">Scan with phone camera to join typing test</div>
            <div class="url">${activeEvent.joinUrl}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
          <Play className="w-3 h-3 fill-current" />
          <span>Active</span>
        </span>
      );
    }
    if (s === 'upcoming' || s === 'scheduled' || s === 'draft') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3 h-3" />
          <span>Upcoming</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
        <CheckCircle2 className="w-3 h-3" />
        <span>Ended</span>
      </span>
    );
  };

  const statsCards = [
    {
      title: 'Total Students',
      value: statsData.totalParticipants.toString(),
      change: 'Registered participants',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Completed Tests',
      value: statsData.completed.toString(),
      change: 'Submitted attempts',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Pending Attempts',
      value: statsData.pending.toString(),
      change: 'In competition queue',
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Active Event',
      value: activeEvent ? activeEvent.eventCode : 'None',
      change: activeEvent ? activeEvent.title : 'No active event',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 relative">
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {copySuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center space-x-2 pointer-events-auto"
            >
              <Check className="w-4 h-4" />
              <span>Student registration URL copied to clipboard!</span>
            </motion.div>
          )}

          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-2xl glass-card border shadow-2xl pointer-events-auto flex items-start space-x-3 ${
                toast.type === 'warning'
                  ? 'border-amber-500/40 bg-amber-950/80 text-amber-200'
                  : toast.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200'
                  : 'border-blue-500/40 bg-slate-900/90 text-blue-200'
              }`}
            >
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-xs">{toast.title}</h4>
                <p className="text-xs opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Admin Command Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Live monitoring dashboard, student registration QR, and real-time metrics.
        </p>
      </div>

      {/* Top 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-3xl glass-card border flex items-center justify-between shadow-xl"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">{stat.title}</p>
                <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[130px]">
                  {stat.change}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-md`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* MAIN FEATURE: PERMANENT STUDENT REGISTRATION QR CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 sm:p-8 rounded-3xl glass-card border border-indigo-500/40 shadow-2xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
              Permanent Live QR Code
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-0.5">
              Student Registration QR
            </h2>
          </div>

          {activeEvent && (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400 font-medium">Current Status:</span>
              {getStatusBadge(activeEvent.status)}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading Student Registration QR...</p>
          </div>
        ) : !activeEvent ? (
          <div className="p-8 text-center space-y-3">
            <QrCode className="w-12 h-12 mx-auto text-slate-500" />
            <h3 className="font-bold text-lg">No Active Competition Event</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Go to the <strong>Events</strong> tab to create and activate a typing competition event. The QR Code will automatically appear here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Large 300x300 Responsive Centered QR Code Display */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3">
              <div className="p-5 rounded-3xl bg-white shadow-2xl border-4 border-indigo-500/30 inline-block hover:scale-[1.01] transition-all">
                <QRCodeCanvas
                  id="dashboard-qr-canvas"
                  value={activeEvent.joinUrl}
                  size={260}
                  level="H"
                  includeMargin={true}
                />
                <div className="hidden">
                  <QRCodeSVG
                    id="dashboard-qr-svg"
                    value={activeEvent.joinUrl}
                    size={300}
                    level="H"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Scan with mobile camera to open Registration Page
              </p>
            </div>

            {/* Right Column: Event Info & Control Buttons */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-400 font-mono">
                  EVENT CODE: {activeEvent.eventCode}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {activeEvent.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Participants Joined</span>
                  <p className="text-xl font-extrabold text-indigo-400">
                    {activeEvent.participantCount || 0} Students
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Test Duration</span>
                  <p className="text-xl font-extrabold text-emerald-400">
                    {activeEvent.duration} Seconds
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Difficulty</span>
                  <p className="text-xl font-extrabold text-amber-400">
                    {activeEvent.difficulty}
                  </p>
                </div>
              </div>

              {/* Join URL Display */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Student Registration Join URL
                </label>
                <input
                  type="text"
                  readOnly
                  value={activeEvent.joinUrl}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-indigo-300 focus:outline-none"
                />
              </div>

              {/* Action Buttons: Copy Link, Download PNG, Print QR, Refresh QR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <button
                  onClick={copyJoinUrl}
                  className="py-3 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>

                <button
                  onClick={downloadQrPng}
                  className="py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={printQrCode}
                  className="py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print QR</span>
                </button>

                <button
                  onClick={handleRefreshActiveEvent}
                  disabled={refreshingQr}
                  className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshingQr ? 'animate-spin' : ''}`} />
                  <span>Refresh QR</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
