
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import api from '@/service/api';

interface TimeoutSettings {
  active: number; // minutes of inactivity
  timeout: number; // hours of max session
}

export function useAutoLogout() {
  const { logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const inactivityTimerRef = useRef<number | null>(null);
  const inactivityWarningRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<number | null>(null);
  const sessionWarningRef = useRef<number | null>(null);
  const loginTimeRef = useRef<number>(Date.now());
  const [settings, setSettings] = useState<TimeoutSettings>({ active: 10, timeout: 7 });
  const [sessionWarningVisible, setSessionWarningVisible] = useState(false);
  const [sessionMinutesLeft, setSessionMinutesLeft] = useState(0);
  const [inactivityWarningVisible, setInactivityWarningVisible] = useState(false);
  const [inactivitySecondsLeft, setInactivitySecondsLeft] = useState(0);
  const countdownRef = useRef<number | null>(null);

  // Fetch settings from server
  const fetchSettings = useCallback(async () => {
    try {
      const response = await api.get('/api/profile/timeout-settings');
      if (response.data) {
        const newSettings = {
          active: response.data.active || 10,
          timeout: response.data.timeout || 7
        };
        setSettings(newSettings);
        localStorage.setItem('timeout_settings', JSON.stringify(newSettings));
      }
    } catch {
      // Fallback to localStorage
      try {
        const cached = localStorage.getItem('timeout_settings');
        if (cached) setSettings(JSON.parse(cached));
      } catch {}
    }
  }, []);

  // Listen for settings updates
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchSettings();

    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem('timeout_settings');
        if (cached) setSettings(JSON.parse(cached));
      } catch {}
    };
    window.addEventListener('timeout:updated', handleUpdate);
    return () => window.removeEventListener('timeout:updated', handleUpdate);
  }, [isAuthenticated, fetchSettings]);

  // Track page navigation for activity
  useEffect(() => {
    if (!isAuthenticated) return;
    const pages = JSON.parse(localStorage.getItem('visited_pages') || '[]');
    const current = window.location.pathname;
    if (!pages.includes(current)) {
      pages.push(current);
      localStorage.setItem('visited_pages', JSON.stringify(pages));
    }
  }, [isAuthenticated]);

  // ===== INACTIVITY TIMER =====
  const clearInactivityTimers = useCallback(() => {
    if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
    if (inactivityWarningRef.current) window.clearTimeout(inactivityWarningRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
    setInactivityWarningVisible(false);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimers();
    if (!isAuthenticated) return;

    const inactivityMs = settings.active * 60 * 1000;
    const warningMs = Math.max(inactivityMs - 60000, 0); // 1 min before

    // Warning 1 min before
    inactivityWarningRef.current = window.setTimeout(() => {
      setInactivityWarningVisible(true);
      setInactivitySecondsLeft(60);
      countdownRef.current = window.setInterval(() => {
        setInactivitySecondsLeft(prev => {
          if (prev <= 1) {
            if (countdownRef.current) window.clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warningMs);

    // Actual logout
    inactivityTimerRef.current = window.setTimeout(() => {
      setInactivityWarningVisible(false);
      logout();
      toast({
        title: "⏱️ Session expirée",
        description: `Déconnecté après ${settings.active} minutes d'inactivité`,
        variant: "destructive",
      });
    }, inactivityMs);
  }, [isAuthenticated, settings.active, logout, toast, clearInactivityTimers]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    resetInactivityTimer();
    events.forEach(event => document.addEventListener(event, handleActivity));

    return () => {
      clearInactivityTimers();
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [isAuthenticated, resetInactivityTimer, clearInactivityTimers]);

  // ===== SESSION TIMEOUT TIMER =====
  useEffect(() => {
    if (!isAuthenticated) return;

    loginTimeRef.current = Date.now();
    const timeoutMs = settings.timeout * 60 * 60 * 1000;
    const warningMs = Math.max(timeoutMs - 10 * 60 * 1000, 0); // 10 min before

    // Warning 10 min before
    sessionWarningRef.current = window.setTimeout(() => {
      setSessionWarningVisible(true);
      setSessionMinutesLeft(10);
      const interval = window.setInterval(() => {
        const elapsed = Date.now() - loginTimeRef.current;
        const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 60000));
        setSessionMinutesLeft(remaining);
        if (remaining <= 0) window.clearInterval(interval);
      }, 30000);
    }, warningMs);

    // Actual logout
    sessionTimerRef.current = window.setTimeout(() => {
      setSessionWarningVisible(false);
      logout();
      toast({
        title: "⏱️ Timeout de session",
        description: `Session expirée après ${settings.timeout}h. Veuillez vous reconnecter.`,
        variant: "destructive",
      });
    }, timeoutMs);

    return () => {
      if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
      if (sessionWarningRef.current) window.clearTimeout(sessionWarningRef.current);
      setSessionWarningVisible(false);
    };
  }, [isAuthenticated, settings.timeout, logout, toast]);

  // Extend session (add more time)
  const extendSession = useCallback(() => {
    // This just resets the warning; in practice the user goes to settings to add more time
    setSessionWarningVisible(false);
  }, []);

  return {
    sessionWarningVisible,
    sessionMinutesLeft,
    inactivityWarningVisible,
    inactivitySecondsLeft,
    extendSession,
    settings,
  };
}
