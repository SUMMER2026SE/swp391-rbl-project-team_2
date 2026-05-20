import React from 'react';
import { clsx } from 'clsx';
import './OtpInput.css';

/**
 * Reusable OTP digit input component.
 * Each box accepts a single digit with auto-focus navigation.
 */
const OtpInput = ({ otp, setRef, handleChange, handleKeyDown, handlePaste, error }) => {
  return (
    <div className="otp-input-group" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => setRef(el, index)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={clsx(
            'otp-input-box',
            digit && 'filled',
            error && 'error'
          )}
          aria-label={`Digit ${index + 1}`}
          id={`otp-digit-${index}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
