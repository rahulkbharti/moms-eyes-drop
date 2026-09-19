import { useState, useEffect } from 'react';

/**
 * Custom hook providing a reactive current time, updated every intervalMs (default 60 seconds)
 */
export const useCurrentTime = (intervalMs = 60000) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return currentTime;
};
