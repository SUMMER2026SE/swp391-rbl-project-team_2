import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import './ForgotPasswordPage.css'; // Reuse existing styles

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  // Redirect if no email/otp in state
  if (!email || !otp) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-header">
          <h1>Invalid Access</h1>
          <p>Please start the password reset process from the beginning.</p>
          <Button variant="primary" onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}>
            Go to Forgot Password
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await authService.resetPassword({
        email,
        otp,
        newPassword: password,
      });

      if (!response.success) throw new Error(response.message);
      
      alert('Password updated successfully! Please login with your new password.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-header">
        <div className="icon-circle">
          <Lock size={28} />
        </div>
        <h1>Reset Password</h1>
        <p>Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="forgot-password-form">
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError('');
          }}
          leftIcon={<Lock size={18} />}
          error={error}
        />
        
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (error) setError('');
          }}
          leftIcon={<Lock size={18} />}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          className="submit-btn"
        >
          <span>Update Password</span>
          <ArrowRight size={18} />
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
