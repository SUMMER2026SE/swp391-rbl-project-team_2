import { useState, useRef, useCallback } from 'react';

const OTP_LENGTH = 6;

/**
 * Custom hook to manage OTP input state and navigation logic.
 * Handles auto-focus, paste support, and backspace navigation.
 */
const useOtpInput = (length = OTP_LENGTH) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  const setRef = useCallback((el, index) => {
    inputRefs.current[index] = el;
  }, []);

  const focusInput = useCallback((index) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  }, [length]);

  const handleChange = useCallback((index, value) => {
    // Only accept single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }
  }, [length, focusInput]);

  const handleKeyDown = useCallback((index, event) => {
    if (event.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        focusInput(index - 1);
      }
      setOtp((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
    } else if (event.key === 'ArrowLeft') {
      focusInput(index - 1);
    } else if (event.key === 'ArrowRight') {
      focusInput(index + 1);
    }
  }, [otp, focusInput]);

  const handlePaste = useCallback((event) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text').replace(/\D/g, '');
    const digits = pastedText.slice(0, length).split('');

    setOtp((prev) => {
      const next = [...prev];
      digits.forEach((d, i) => {
        next[i] = d;
      });
      return next;
    });

    // Focus the next empty input or the last filled one
    const nextIndex = Math.min(digits.length, length - 1);
    focusInput(nextIndex);
  }, [length, focusInput]);

  const resetOtp = useCallback(() => {
    setOtp(Array(length).fill(''));
    focusInput(0);
  }, [length, focusInput]);

  const otpValue = otp.join('');
  const isComplete = otp.every((d) => d !== '');

  return {
    otp,
    otpValue,
    isComplete,
    setRef,
    handleChange,
    handleKeyDown,
    handlePaste,
    resetOtp,
    focusInput,
  };
};

export default useOtpInput;
