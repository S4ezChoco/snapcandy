import { useState, useRef, useCallback } from 'react';

interface UseCountdownReturn {
  count: number;
  isRunning: boolean;
  start: (seconds: number) => Promise<void>;
  reset: () => void;
}

export function useCountdown(): UseCountdownReturn {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCount(0);
    setIsRunning(false);
    if (resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number): Promise<void> => {
      return new Promise<void>((resolve) => {
        // Clear any existing countdown
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        resolveRef.current = resolve;
        setCount(seconds);
        setIsRunning(true);

        let remaining = seconds;

        intervalRef.current = setInterval(() => {
          remaining -= 1;
          setCount(remaining);

          if (remaining <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setIsRunning(false);
            resolveRef.current = null;
            resolve();
          }
        }, 1000);
      });
    },
    [],
  );

  return { count, isRunning, start, reset };
}
