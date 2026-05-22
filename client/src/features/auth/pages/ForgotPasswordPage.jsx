import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // In a real app, you might show a success message here or redirect
      console.log('Reset link sent to:', email);
    }, 1000);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-header">
        <div className="icon-circle">
          <RotateCcw size={28} />
        </div>
        <h1>Forgot Password</h1>
        <p>
          Enter your email to reset your password.<br />
          We'll send you a secure link to create a new one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="forgot-password-form">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
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
          <span>Send Reset Link</span>
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="forgot-password-footer">
        <Link to={ROUTES.LOGIN} className="return-login-link">
          <ArrowLeft size={16} />
          <span>Return to Login</span>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
