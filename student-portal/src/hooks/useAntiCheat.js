import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export const useAntiCheat = ({ isActive, studentId, eventId, onAutoSubmit }) => {
  const [warningsCount, setWarningsCount] = useState(0);
  const [lastWarningReason, setLastWarningReason] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);

  const triggerWarning = useCallback(
    async (reason) => {
      if (!isActive) return;

      setWarningsCount((prev) => {
        const nextCount = prev + 1;
        setLastWarningReason(reason);
        setShowWarningModal(true);

        // Report warning to backend API asynchronously
        api
          .post('/anti-cheat/log-warning', {
            studentId,
            eventId,
            warningCount: nextCount,
            reason,
          })
          .catch((err) => console.warn('Anti-cheat log error:', err));

        if (nextCount >= 3) {
          if (onAutoSubmit) onAutoSubmit(nextCount, reason);
        }

        return nextCount;
      });
    },
    [isActive, studentId, eventId, onAutoSubmit]
  );

  useEffect(() => {
    if (!isActive) return;

    // 1. Tab Switching & Window Visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerWarning('Tab Switch Detected');
      }
    };

    // 2. Window Blur (Focus Loss)
    const handleWindowBlur = () => {
      triggerWarning('Window Focus Lost');
    };

    // 3. DevTools & Inspection Shortcuts
    const handleKeyDown = (e) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        triggerWarning('DevTools Inspection Shortcut (F12)');
      }
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        triggerWarning('DevTools Inspection Shortcut (Ctrl+Shift+Key)');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        triggerWarning('Source View Shortcut (Ctrl+U)');
      }
    };

    // 4. Right-Click Context Menu Lock
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerWarning('Right-Click Context Menu Attempt');
    };

    // 5. Prevent Reload / Exit Warning
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Warning: Leaving or refreshing this page will submit your typing test.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive, triggerWarning]);

  const dismissWarningModal = () => {
    setShowWarningModal(false);
  };

  return {
    warningsCount,
    lastWarningReason,
    showWarningModal,
    dismissWarningModal,
  };
};
