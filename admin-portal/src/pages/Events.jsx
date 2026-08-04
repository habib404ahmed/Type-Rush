import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Calendar,
  Plus,
  QrCode,
  Play,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  Copy,
  ExternalLink,
  Printer,
  Zap,
  Users,
  Search,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import api from '../services/api';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [qrModalEvent, setQrModalEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    difficulty: 'Medium',
    status: 'Active',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '',
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/events', formData);
      if (res.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          duration: 60,
          difficulty: 'Medium',
          status: 'Active',
          startDate: new Date().toISOString().slice(0, 16),
          endDate: '',
        });
        fetchEvents();
      }
    } catch (err) {
      alert('Could not create event: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (eventId, newStatus) => {
    try {
      const res = await api.patch(`/events/${eventId}/status`, { status: newStatus });
      if (res.success) {
        fetchEvents();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this competition event?')) return;
    try {
      const res = await api.delete(`/events/${eventId}`);
      if (res.success) {
        fetchEvents();
      }
    } catch (err) {
      alert('Error deleting event: ' + err.message);
    }
  };

  // 1-Click PNG Download
  const downloadQrPng = (event) => {
    const canvas = document.getElementById(`qr-canvas-${event._id}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `TypeRush_QR_${event.eventCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // 1-Click SVG Download
  const downloadQrSvg = (event) => {
    const svgElement = document.getElementById(`qr-svg-${event._id}`);
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `TypeRush_QR_${event.eventCode}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Copy Link with Toast
  const copyJoinUrl = (joinUrl) => {
    navigator.clipboard.writeText(joinUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Print QR Code Only
  const printQrCode = (event) => {
    const canvas = document.getElementById(`qr-canvas-${event._id}`);
    if (!canvas) return;
    const qrDataUrl = canvas.toDataURL('image/png');

    const printWindow = window.open('', '_blank', 'width=600,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${event.title}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center;
              padding: 40px;
              color: #1e293b;
            }
            .card {
              border: 3px solid #6366f1;
              border-radius: 24px;
              padding: 30px;
              max-width: 400px;
              margin: 0 auto;
              background: #ffffff;
            }
            h1 { font-size: 24px; margin-bottom: 8px; color: #4f46e5; }
            .code { font-family: monospace; font-size: 20px; font-weight: bold; background: #e0e7ff; padding: 4px 12px; border-radius: 8px; display: inline-block; margin-bottom: 20px; }
            img { width: 220px; height: 220px; margin: 15px 0; }
            .url { font-family: monospace; font-size: 12px; color: #64748b; word-break: break-all; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${event.title}</h1>
            <div class="code">EVENT CODE: ${event.eventCode}</div>
            <br />
            <img src="${qrDataUrl}" alt="QR Code" />
            <div class="url">${event.joinUrl}</div>
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

  const filteredEvents = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.eventCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Active</span>
        </span>
      );
    }
    if (s === 'upcoming' || s === 'scheduled' || s === 'draft') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          <span>Upcoming</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Ended</span>
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {copySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Join URL copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Event Management & QR System
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create competition events, generate join QR codes, and manage active status.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by event title or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card border text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">No Events Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Click "Create New Event" to set up a new typing competition with an auto-generated QR Code.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => (
            <motion.div
              key={ev._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all duration-200 shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(ev.status)}
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {ev.eventCode}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-lg leading-snug">{ev.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.duration}s</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{ev.difficulty}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{ev.participantCount || 0} Students</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Mini Preview & Action Buttons */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="p-1 rounded-lg bg-white inline-block">
                    <QRCodeCanvas
                      id={`qr-canvas-${ev._id}`}
                      value={ev.joinUrl}
                      size={44}
                      level="M"
                    />
                    <div className="hidden">
                      <QRCodeSVG
                        id={`qr-svg-${ev._id}`}
                        value={ev.joinUrl}
                        size={200}
                        level="H"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block">QR Code Join Link</span>
                    <span className="font-mono text-[10px] text-indigo-300 truncate max-w-[120px] block">
                      {ev.joinUrl}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setQrModalEvent(ev)}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View QR</span>
                </button>
              </div>

              {/* Status Controls */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  {(ev.status === 'Upcoming' || ev.status === 'draft' || ev.status === 'scheduled') && (
                    <button
                      onClick={() => handleStatusToggle(ev._id, 'Active')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 text-xs font-semibold transition-all"
                    >
                      Make Active
                    </button>
                  )}

                  {(ev.status === 'Active' || ev.status === 'active') && (
                    <button
                      onClick={() => handleStatusToggle(ev._id, 'Ended')}
                      className="px-3 py-1.5 rounded-lg bg-slate-500/10 hover:bg-slate-500 hover:text-white text-slate-400 text-xs font-semibold transition-all"
                    >
                      End Event
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteEvent(ev._id)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition-all"
                  title="Delete Event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg p-6 rounded-3xl glass-card border border-purple-500/30 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Create New Competition Event</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Name / Championship Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Freshers Typing Competition 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      End Date & Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Duration
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                    >
                      <option value={30}>30s</option>
                      <option value={60}>60s (1m)</option>
                      <option value={90}>90s</option>
                      <option value={120}>120s (2m)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Random">Random</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ended">Ended</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {submitting ? 'Generating Event...' : 'Create Event & Generate QR'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL QR CODE VIEW & ACTIONS MODAL */}
      <AnimatePresence>
        {qrModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-card border border-purple-500/40 shadow-2xl space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-xl">{qrModalEvent.title}</h3>
                <button
                  onClick={() => setQrModalEvent(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Info Bar */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Event Code</span>
                  <span className="font-mono text-sm font-extrabold text-purple-400">{qrModalEvent.eventCode}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <div className="mt-0.5">{getStatusBadge(qrModalEvent.status)}</div>
                </div>
              </div>

              {/* Join URL Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 text-left">
                  Student Join URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={qrModalEvent.joinUrl}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 focus:outline-none"
                  />
                  <button
                    onClick={() => copyJoinUrl(qrModalEvent.joinUrl)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 shadow"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Large Centered QR Display */}
              <div className="p-5 rounded-3xl bg-white mx-auto inline-block shadow-2xl border-4 border-indigo-500/30">
                <QRCodeCanvas
                  id={`qr-canvas-${qrModalEvent._id}`}
                  value={qrModalEvent.joinUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <button
                  onClick={() => downloadQrPng(qrModalEvent)}
                  className="py-2.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>

                <button
                  onClick={() => downloadQrSvg(qrModalEvent)}
                  className="py-2.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>SVG</span>
                </button>

                <a
                  href={qrModalEvent.joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Link</span>
                </a>

                <button
                  onClick={() => printQrCode(qrModalEvent)}
                  className="py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print QR</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
