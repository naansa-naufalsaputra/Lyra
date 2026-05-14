/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';

interface FocusContextType {
  timeLeft: number;
  isActive: boolean;
  isCompleted: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  setTimeLeft: (seconds: number) => void;
}

export const FocusContext = createContext<FocusContextType | undefined>(undefined);

const DEFAULT_TIME = 25 * 60;

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeftState] = useState(() => {
    const saved = localStorage.getItem('lyra-focus-time');
    return saved ? parseInt(saved, 10) : DEFAULT_TIME;
  });
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const initialTimeLeftRef = useRef<number>(timeLeft);

  // Persistence
  useEffect(() => {
    localStorage.setItem('lyra-focus-time', timeLeft.toString());
  }, [timeLeft]);

  // Handle case where user leaves and comes back while timer is active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        // We don't stop the timer, setInterval continues in background but less accurately
        // The Date.now() logic in the main interval will correct it on next tick
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive]);

  // Sound generator
  const playNotificationSound = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio context failed", e);
    }
  };

  const sendNotification = useCallback(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Focus Session Complete", {
        body: "Great job! Time to take a short break.",
        icon: "/icon-192.png"
      });
    }
    playNotificationSound();
  }, []);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      initialTimeLeftRef.current = timeLeft;

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
        const newTimeLeft = Math.max(0, initialTimeLeftRef.current - elapsed);
        
        setTimeLeftState(newTimeLeft);

        if (newTimeLeft === 0) {
          setIsActive(false);
          setIsCompleted(true);
          sendNotification();
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);


  const toggleTimer = () => {
    if (isCompleted) {
      setTimeLeftState(DEFAULT_TIME);
      setIsCompleted(false);
    }
    
    if (!isActive && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    setTimeLeftState(DEFAULT_TIME);
    localStorage.removeItem('lyra-focus-time');
  };

  const setTimeLeft = (seconds: number) => {
    setTimeLeftState(seconds);
    initialTimeLeftRef.current = seconds;
    localStorage.setItem('lyra-focus-time', seconds.toString());
  };

  return (
    <FocusContext.Provider value={{ 
      timeLeft, 
      isActive, 
      isCompleted,
      toggleTimer, 
      resetTimer,
      setTimeLeft
    }}>
      {children}
    </FocusContext.Provider>
  );
};
