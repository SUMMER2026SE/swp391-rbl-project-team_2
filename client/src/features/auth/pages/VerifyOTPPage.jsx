import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import './ForgotPasswordPage.css'; // Reuse existing styles

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const type = location.state?.type || 'verify_email'; // 'verify_email' or 'forgot_password'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please try again.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (type === 'forgot_password') {
        // For forgot password, navigate to reset password page with email and OTP
        navigate(ROUTES.RESET_PASSWORD, { state: { email, otp } });
      } else {
        // For email verification
        const response = await authService.verifyEmail({ email, otp });
        if (!response.success) throw new Error(response.message);
        
        toast.success('Email verified successfully! Please login.');
        navigate(ROUTES.LOGIN);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to verify OTP';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await authService.resendOtp({ email, purpose: type });
      if (!response.success) throw new Error(response.message);
      toast('New OTP sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP';
      toast(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-header">
        <div className="icon-circle">
          <ShieldCheck size={28} />
        </div>
        <h1>Verify OTP</h1>
        <p>
          We've sent a one-time password (OTP) to your email.<br />
          Please enter it below to verify.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="forgot-password-form">
        <Input
          label="One-Time Password (OTP)"
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value);
            if (error) setError('');
          }}
          error={error}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          className="submit-btn"
        >
          <span>Verify</span>
          <ArrowRight size={18} />
        </Button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline',
            }}
          >
            {isResending ? 'Sending...' : "Didn't receive the code? Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyOTPPage;
