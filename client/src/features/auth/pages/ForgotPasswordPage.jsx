import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCcw, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useTranslation } from 'react-i18next';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError(t('auth.forgotPassword.errorEmptyEmail', 'Please enter your email address'));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.login.invalidEmail', 'Please enter a valid email address'));
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword(email);
      if (!response.success) throw new Error(response.message);

      navigate(ROUTES.VERIFY_OTP, { state: { email, type: 'forgot_password' } });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t('auth.forgotPassword.errorSendFailed', 'Failed to send reset link');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-header">
        <div className="icon-circle">
          <RotateCcw size={28} />
        </div>
        <h1>{t('auth.forgotPassword.title', 'Forgot Password')}</h1>
        <p>
          {t('auth.forgotPassword.subtitle1', 'Enter your email to reset your password.')}<br />
          {t('auth.forgotPassword.subtitle2', "We'll send you a secure OTP code to create a new one.")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="forgot-password-form">
        <Input
          label={t('auth.login.emailLabel', 'Email Address')}
          type="email"
          placeholder={t('auth.login.emailPlaceholder', 'name@example.com')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          leftIcon={<Mail size={18} />}
          error={error}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          className="submit-btn"
        >
          <span>{t('auth.forgotPassword.resetBtn', 'Reset Password')}</span>
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="forgot-password-footer">
        <Link to={ROUTES.LOGIN} className="return-login-link">
          <ArrowLeft size={16} />
          <span>{t('auth.forgotPassword.returnToLogin', 'Return to Login')}</span>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
