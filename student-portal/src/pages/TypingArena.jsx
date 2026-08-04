import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAntiCheat } from '../hooks/useAntiCheat';

export const TypingArena = () => {

  const navigate = useNavigate();

  // Session state from registration
  const [student, setStudent] = useState(null);
  const [event, setEvent] = useState(null);
  const [paragraph, setParagraph] = useState(null);
  const [loading, setLoading] = useState(true);

  // Countdown & Arena State
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  // Typing engine metrics
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize session and fetch paragraph
  useEffect(() => {
    const storedStudent = localStorage.getItem('typerush_student_info');
    const storedEvent = localStorage.getItem('typerush_event_info');

    if (!storedStudent || !storedEvent) {
      alert('Please register for an active competition event first.');
      navigate('/register');
      return;
    }

    const parsedStudent = JSON.parse(storedStudent);
    const parsedEvent = JSON.parse(storedEvent);

    setStudent(parsedStudent);
    setEvent(parsedEvent);
    setTimeLeft(parsedEvent.duration || 60);

    fetchParagraph(parsedEvent.difficulty);
  }, [navigate]);

  const fetchParagraph = async (difficulty) => {
    try {
      setLoading(true);
      const res = await api.get(`/paragraphs/random?difficulty=${difficulty || 'Medium'}`);
      if (res.success && res.paragraph) {
        setParagraph(res.paragraph);
      }
    } catch (err) {
      console.error('Error fetching paragraph:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3-2-1 Countdown Timer
  useEffect(() => {
    if (loading || !showCountdown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowCountdown(false);
      // Focus hidden typing input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [countdown, loading, showCountdown]);

  // Main Test Duration Timer
  useEffect(() => {
    if (!testStarted || testCompleted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [testStarted, testCompleted]);

  const handleInputChange = (e) => {
    if (testCompleted) return;

    const value = e.target.value;

    // Start timer on first keystroke
    if (!testStarted && value.length > 0) {
      setTestStarted(true);
    }

    const targetText = paragraph ? paragraph.content : '';

    // Calculate mistakes and correct chars
    let newMistakes = 0;
    let newCorrect = 0;

    for (let i = 0; i < value.length; i++) {
      if (value[i] === targetText[i]) {
        newCorrect++;
      } else {
        newMistakes++;
      }
    }

    setMistakes(newMistakes);
    setCorrectChars(newCorrect);
    setUserInput(value);

    // Auto-finish if full paragraph typed
    if (value.length >= targetText.length) {
      clearInterval(timerRef.current);
      handleFinishTest();
    }
  };

  const handleFinishTest = async (overrideWarnings) => {
    setTestCompleted(true);
    setTestStarted(false);

    const totalTyped = userInput.length;
    const timeInMinutes = Math.max(0.1, (event?.duration - timeLeft) / 60);

    const grossWpm = Math.round(totalTyped / 5 / timeInMinutes);
    const netWpm = Math.max(0, Math.round((totalTyped - mistakes) / 5 / timeInMinutes));
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);

    const activeWarnings = typeof overrideWarnings === 'number' ? overrideWarnings : warningsCount;

    const payload = {
      studentId: student?.id,
      eventId: event?.id,
      paragraphId: paragraph?._id,
      grossWpm,
      netWpm,
      accuracy,
      mistakes,
      correctChars,
      incorrectChars: mistakes,
      warningsCount: activeWarnings,
      timeTakenSeconds: event?.duration - timeLeft,
    };

    try {
      const res = await api.post('/results/submit', payload);
      if (res.success && res.result) {
        localStorage.setItem('typerush_last_result', JSON.stringify(res.result));
      } else {
        localStorage.setItem('typerush_last_result', JSON.stringify(payload));
      }
    } catch (err) {
      console.warn('[Result Submission Fallback]:', err.message);
      localStorage.setItem('typerush_last_result', JSON.stringify(payload));
    }

    navigate('/results');
  };


  // Anti-Cheat Hook Integration
  const { warningsCount, lastWarningReason, showWarningModal, dismissWarningModal } =
    useAntiCheat({
      isActive: testStarted && !testCompleted,
      studentId: student?.id,
      eventId: event?.id,
      onAutoSubmit: (count, reason) => {
        alert(`Disqualification Triggered! ${reason}. (Warning ${count}/3). Test auto-submitting.`);
        handleFinishTest(count);
      },
    });


  // Metric Calculations
  const targetText = paragraph ? paragraph.content : '';
  const totalTyped = userInput.length;
  const timeInMinutes = elapsedSeconds === 0 ? 0.01 : elapsedSeconds / 60;

  const liveGrossWpm = Math.round(totalTyped / 5 / timeInMinutes);
  const liveNetWpm = Math.max(0, Math.round((totalTyped - mistakes) / 5 / timeInMinutes));
  const liveAccuracy = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);
  const progressPercent = Math.min(100, Math.round((totalTyped / targetText.length) * 100));

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-8 max-w-5xl mx-auto">
      {/* 3-2-1 Countdown Overlay Modal */}
      <AnimatePresence>
        {showCountdown && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md">
            <motion.div
              key={countdown}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {countdown > 0 ? (
                <span className="text-8xl sm:text-9xl font-black gradient-text font-mono">
                  {countdown}
                </span>
              ) : (
                <span className="text-6xl sm:text-7xl font-black text-emerald-400 tracking-wider uppercase">
                  READY TO RUSH!
                </span>
              )}
              <p className="text-sm font-semibold text-slate-400 mt-4">
                Get ready! Typing arena starts immediately.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top HUD Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl glass-card text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Time Left
          </span>
          <span className="text-2xl font-black font-mono text-amber-400 flex items-center justify-center space-x-1 mt-1">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>{timeLeft}s</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl glass-card text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Net WPM
          </span>
          <span className="text-2xl font-black font-mono text-indigo-400 flex items-center justify-center space-x-1 mt-1">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span>{liveNetWpm}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl glass-card text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Accuracy
          </span>
          <span className="text-2xl font-black font-mono text-emerald-400 flex items-center justify-center space-x-1 mt-1">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>{liveAccuracy}%</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl glass-card text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Mistakes
          </span>
          <span className="text-2xl font-black font-mono text-rose-400 flex items-center justify-center space-x-1 mt-1">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>{mistakes}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl glass-card text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Progress
          </span>
          <span className="text-2xl font-black font-mono text-pink-400 flex items-center justify-center space-x-1 mt-1">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <span>{progressPercent}%</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          style={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Typing Text Box Display */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative min-h-[220px] p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-800/80 cursor-text shadow-2xl space-y-4 mb-6"
      >
        {!testStarted && !testCompleted && (
          <div className="absolute inset-x-0 -top-3 flex justify-center">
            <span className="px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30 animate-bounce">
              ⌨️ Start typing to launch competition timer!
            </span>
          </div>
        )}

        <div className="font-mono text-lg sm:text-2xl leading-relaxed tracking-wide select-none">
          {targetText.split('').map((char, index) => {
            let charStyle = 'text-slate-400';
            if (index < userInput.length) {
              if (userInput[index] === char) {
                charStyle = 'text-emerald-400 bg-emerald-500/10 font-bold';
              } else {
                charStyle = 'text-red-400 bg-red-500/20 underline decoration-red-500 font-bold';
              }
            }

            const isCurrentCursor = index === userInput.length;

            return (
              <span
                key={index}
                className={`${charStyle} ${
                  isCurrentCursor ? 'bg-indigo-500/40 text-white rounded-sm underline animate-pulse' : ''
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Hidden Input for Keystroke Capture with Strict Anti-Copy Restrictions */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onCopy={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          autoComplete="off"
          className="opacity-0 absolute inset-0 w-full h-full cursor-default"
          disabled={testCompleted}
        />
      </div>

      {/* Footer Instructions & Anti-Copy Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Anti-Copy & Anti-Cheat Shield Active (Warnings: {warningsCount}/3)</span>
        </div>
        <div>
          Characters remaining: <span className="font-mono font-bold text-slate-200">{Math.max(0, targetText.length - userInput.length)}</span>
        </div>
      </div>

      {/* Anti-Cheat Warning Popup Modal */}
      <AnimatePresence>
        {showWarningModal && warningsCount < 3 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="w-full max-w-md p-6 rounded-3xl glass-card border border-rose-500/40 shadow-2xl text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center animate-bounce">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 font-mono text-xs font-bold border border-rose-500/30">
                  ANTI-CHEAT WARNING {warningsCount} OF 3
                </span>
                <h3 className="text-xl font-extrabold text-white pt-2">
                  Security Violation Detected!
                </h3>
                <p className="text-xs text-rose-300 font-medium pt-1">
                  Reason: {lastWarningReason}
                </p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tab switching, window blur, inspecting code, or right-clicking is strictly forbidden during typing competitions. Reaching Warning 3 will instantly disqualify your attempt.
              </p>
              <button
                onClick={dismissWarningModal}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 font-bold text-sm text-white shadow-lg shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                I Understand - Return to Test
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

