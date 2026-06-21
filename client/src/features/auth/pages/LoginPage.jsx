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
import './LoginPage.css';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});




const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const { user, isAuthenticated } = useAuthStore();

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
      const msg = error.response?.data?.message || error.message || 'Login failed';
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
      const msg = error.response?.data?.message || error.message || 'Google login failed';
      toast(msg);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Login Failed');
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>Welcome back</h1>
        <p>Sign in to find and manage your perfect rental room.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <Input
          label="Email address"
          type="email"
          placeholder="name@example.com"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          leftIcon={<Lock size={18} />}
          rightIcon={
            <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          }
          rightLabel={
            <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-password">Forgot password?</Link>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" />
            <span>Remember me for 30 days</span>
          </label>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="divider">
        <span>OR CONTINUE WITH</span>
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
        <p>Don't have an account? <Link to={ROUTES.REGISTER}>Register now</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
