import React, { useState } from 'react';
import { MailCheck, RefreshCw } from 'lucide-react';
import Button from '../../../components/common/Button';
import OtpInput from './OtpInput';
import useOtpInput from '../hooks/useOtpInput';
import useCountdown from '../hooks/useCountdown';
import './EmailVerifyCard.css';

/**
 * Email Verification Card.
 * Renders the "Check your email" OTP flow from the Figma design.
 */
const EmailVerifyCard = ({ email = 'alex@example.com', onVerify, onResend }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const {
    otp,
    otpValue,
    isComplete,
    setRef,
    handleChange,
    handleKeyDown,
    handlePaste,
    resetOtp,
  } = useOtpInput(6);

  const { formattedTime, isActive, restart } = useCountdown(45);

  const handleVerify = async () => {
    if (!isComplete) return;
    setIsLoading(true);
    setError(false);

    try {
      await onVerify?.(otpValue);
    } catch {
      setError(true);
      resetOtp();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    restart();
    resetOtp();
    setError(false);
    onResend?.();
  };

  return (
    <div className="email-verify-card">
      <div className="email-verify-card__icon">
        <MailCheck size={28} />
      </div>

      <h2 className="email-verify-card__title">Check your email</h2>
      <p className="email-verify-card__subtitle">
        We've sent a 6-digit verification code to<br />
        <strong>{email}</strong>
      </p>

      <div className="email-verify-card__otp-wrapper">
        <OtpInput
          otp={otp}
          setRef={setRef}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          handlePaste={handlePaste}
          error={error}
        />
      </div>

      <div className="email-verify-card__btn">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={!isComplete}
          onClick={handleVerify}
          id="btn-verify-email"
        >
          Verify Email
        </Button>
      </div>

      <div className="email-verify-card__resend">
        <span>Didn't receive the code?</span>
        <button
          className="email-verify-card__resend-link"
          onClick={handleResend}
          disabled={isActive}
          id="btn-resend-code"
        >
          <RefreshCw size={13} />
          Resend in {formattedTime}
        </button>
      </div>
    </div>
  );
};

export default EmailVerifyCard;
