import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import useAuthStore from '../../../store/useAuthStore';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useTranslation } from 'react-i18next';
import './LoginPage.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const { user, isAuthenticated } = useAuthStore();

  const loginSchema = z.object({
    email: z.string().email({ message: t('auth.login.invalidEmail', 'Invalid email address') }),
    password: z.string().min(6, { message: t('auth.login.passwordMinLength', 'Password must be at least 6 characters') }),
  });

  React.useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role || 'TENANT';
      if (role === 'LANDLORD') {
        navigate(ROUTES.LANDLORD.DASHBOARD, { replace: true });
      } else if (role === 'ADMIN') {
        navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      login(response.data.user, response.data.token);
      
      const role = response.data.user.role || 'TENANT';
      if (role === 'LANDLORD') {
        navigate(ROUTES.LANDLORD.DASHBOARD);
      } else if (role === 'ADMIN') {
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t('auth.login.loginFailed', 'Login failed');
      toast(msg);
      
      if (msg === 'Please verify your email before logging in.') {
        navigate(ROUTES.VERIFY_OTP, { state: { email: data.email, type: 'verify_email' } });
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      login(response.data.user, response.data.token);
      
      const role = response.data.user.role || 'TENANT';
      if (role === 'LANDLORD') {
        navigate(ROUTES.LANDLORD.DASHBOARD);
      } else if (role === 'ADMIN') {
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t('auth.login.googleLoginFailed', 'Google Login Failed');
      toast(msg);
    }
  };

  const handleGoogleError = () => {
    toast.error(t('auth.login.googleLoginFailed', 'Google Login Failed'));
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>{t('auth.login.welcomeBack', 'Welcome back')}</h1>
        <p>{t('auth.login.subtitle', 'Sign in to find and manage your perfect rental room.')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <Input
          label={t('auth.login.emailLabel', 'Email address')}
          type="email"
          placeholder={t('auth.login.emailPlaceholder', 'name@example.com')}
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label={t('auth.login.passwordLabel', 'Password')}
          type={showPassword ? "text" : "password"}
          placeholder={t('auth.login.passwordPlaceholder', '••••••••')}
          leftIcon={<Lock size={18} />}
          rightIcon={
            <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          }
          rightLabel={
            <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-password">{t('auth.login.forgotPassword', 'Forgot password?')}</Link>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" />
            <span>{t('auth.login.rememberMe', 'Remember me for 30 days')}</span>
          </label>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
          {t('auth.login.signInBtn', 'Sign In')}
        </Button>
      </form>

      <div className="divider">
        <span>{t('auth.login.orContinueWith', 'OR CONTINUE WITH')}</span>
      </div>

      <div className="social-login" style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="100%"
        />
      </div>

      <div className="login-footer">
        <p>{t('auth.login.noAccount', "Don't have an account?")} <Link to={ROUTES.REGISTER}>{t('auth.login.registerNow', 'Register now')}</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
