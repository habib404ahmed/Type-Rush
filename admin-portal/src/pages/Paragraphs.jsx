import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Upload,
  Trash2,
  Edit,
  Zap,
  CheckCircle,
  X,
  Search,
  Loader2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

export const Paragraphs = () => {
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    difficulty: 'Medium',
    category: 'General',
  });

  // Bulk JSON state
  const [jsonText, setJsonText] = useState(`[
  {
    "title": "Quantum Computing Basics",
    "content": "Quantum computing harnesses principles of quantum mechanics like superposition and entanglement to process complex calculations exponentially faster than classical supercomputers.",
    "difficulty": "Hard",
    "category": "Science"
  }
]`);

  const fetchParagraphs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/paragraphs');
      if (res.success) {
        setParagraphs(res.paragraphs || []);
      }
    } catch (err) {
      console.error('Error fetching paragraphs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParagraphs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/paragraphs', formData);
      if (res.success) {
        setShowAddModal(false);
        setFormData({ title: '', content: '', difficulty: 'Medium', category: 'General' });
        fetchParagraphs();
      }
    } catch (err) {
      alert('Error creating paragraph: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        alert('JSON must be an array of paragraph objects');
        return;
      }

      setSubmitting(true);
      const res = await api.post('/paragraphs/bulk-import', { paragraphs: parsed });
      if (res.success) {
        setShowBulkModal(false);
        fetchParagraphs();
        alert(`Successfully imported ${res.count} paragraphs!`);
      }
    } catch (err) {
      alert('Invalid JSON syntax: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this paragraph?')) return;
    try {
      const res = await api.delete(`/paragraphs/${id}`);
      if (res.success) {
        fetchParagraphs();
      }
    } catch (err) {
      alert('Error deleting paragraph: ' + err.message);
    }
  };

  const filteredParagraphs = paragraphs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Easy
          </span>
        );
      case 'Hard':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Hard
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Medium
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Paragraph Content Pool
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage typing passages, difficulty tagging, and bulk JSON imports.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-card border border-purple-500/30 text-purple-400 font-bold text-xs hover:bg-purple-500/10 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Import JSON</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Paragraph</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search paragraph title or text content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Paragraphs Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading paragraph pool...</p>
        </div>
      ) : filteredParagraphs.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card border text-center space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="font-bold text-lg">No Paragraphs Found</h3>
          <p className="text-sm text-slate-500">Add custom passages or import JSON to populate the content pool.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredParagraphs.map((p) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl glass-card border flex flex-col justify-between space-y-4 shadow-md hover:border-purple-500/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    {p.category || 'General'}
                  </span>
                  {getDifficultyBadge(p.difficulty)}
                </div>

                <h3 className="font-bold text-lg leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-400 font-mono leading-relaxed line-clamp-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  {p.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-4">
                  <span>Words: <strong className="text-slate-200">{p.wordCount || p.content.split(' ').length}</strong></span>
                  <span>Chars: <strong className="text-slate-200">{p.charCount || p.content.length}</strong></span>
                </div>

                <button
                  onClick={() => handleDelete(p._id)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition-all"
                  title="Delete Paragraph"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Paragraph Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg p-6 rounded-3xl glass-card border border-purple-500/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Add New Paragraph</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Passage Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Web Architecture"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Technology"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Text Content
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Enter typing test passage content..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs text-slate-400">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-purple-600 font-bold text-xs text-white">
                    {submitting ? 'Saving...' : 'Save Paragraph'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk JSON Import Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg p-6 rounded-3xl glass-card border border-purple-500/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Bulk Import Paragraphs (JSON)</h3>
                <button onClick={() => setShowBulkModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBulkImport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    JSON Array Input
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-300"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-xs text-slate-400">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-xs text-white">
                    {submitting ? 'Importing...' : 'Import JSON Array'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
