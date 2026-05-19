import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for countdown timer.
 * Used for OTP resend cooldown.
 */
const useCountdown = (initialSeconds = 45) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || seconds <= 0) {
      setIsActive(false);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const restart = useCallback(() => {
    setSeconds(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const formattedTime = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return {
    seconds,
    isActive,
    formattedTime,
    restart,
  };
};

export default useCountdown;
