import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Home, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../../store/useAuthStore';
import { authService } from '../services/authService';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useTranslation } from 'react-i18next';
import './RegisterPage.css';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [role, setRole] = useState('TENANT');
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const registerSchema = z.object({
    fullName: z.string().min(2, { message: t('auth.register.nameMinLength', 'Full name is required') }),
    email: z.string().email({ message: t('auth.login.invalidEmail', 'Invalid email address') }),
    phone: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, { message: 'Must be a valid Vietnamese phone number' }),
    password: z.string().min(6, { message: t('auth.login.passwordMinLength', 'Password must be at least 6 characters') }),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: t('auth.register.mustAcceptTerms', 'You must accept the terms') }),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.register.passwordsDoNotMatch', "Passwords don't match"),
    path: ["confirmPassword"],
  });
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false },
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    try {
      const response = await authService.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: role,
      });

      if (!response.success) {
        throw new Error(response.message);
      }
      
      navigate(ROUTES.VERIFY_OTP, { state: { email: data.email, type: 'verify_email' } });
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t('auth.register.registerFailed', 'Registration failed');
      toast(msg);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      login(response.data.user, response.data.token);
      
      const userRole = response.data.user.role || 'TENANT';
      if (userRole === 'LANDLORD') {
        navigate(ROUTES.LANDLORD.DASHBOARD);
      } else if (userRole === 'ADMIN') {
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t('auth.login.googleLoginFailed', 'Google signup failed');
      toast(msg);
    }
  };

  const handleGoogleError = () => {
    toast.error(t('auth.login.googleLoginFailed', 'Google Signup Failed'));
  };

  return (
    <div className="register-form-container">
      <div className="register-header">
        <h1>{t('auth.register.createAccount', 'Create an Account')}</h1>
        <p>{t('auth.register.subtitle', 'Join our community and find your ideal rental room today.')}</p>
      </div>

      <div className="role-selector">
        <p className="role-label">{t('auth.register.roleLabel', 'I am a...')}</p>
        <div className="role-tabs">
          <button 
            type="button"
            className={`role-tab ${role === 'TENANT' ? 'active' : ''}`}
            onClick={() => setRole('TENANT')}
          >
            <User size={18} />
            <span className="role-text">{t('auth.register.roleTenant', 'Tenant')}</span>
          </button>
          <button 
            type="button"
            className={`role-tab ${role === 'LANDLORD' ? 'active' : ''}`}
            onClick={() => setRole('LANDLORD')}
          >
            <Home size={18} />
            <span className="role-text">{t('auth.register.roleLandlord', 'Landlord')}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="register-form">
        <Input 
          label={t('auth.register.fullNameLabel', 'Full Name')} 
          type="text" 
          placeholder={t('auth.register.fullNamePlaceholder', 'John Doe')}
          error={errors.fullName?.message}
          {...register('fullName')} 
        />

        <Input 
          label={t('auth.login.emailLabel', 'Email Address')} 
          type="email" 
          placeholder={t('auth.login.emailPlaceholder', 'john@example.com')}
          error={errors.email?.message}
          {...register('email')} 
        />

        <Input 
          label="Phone Number" 
          type="tel" 
          placeholder="0912345678"
          error={errors.phone?.message}
          {...register('phone')} 
        />
        
        <Input 
          label={t('auth.login.passwordLabel', 'Password')} 
          type="password" 
          placeholder={t('auth.login.passwordPlaceholder', '••••••••')}
          error={errors.password?.message}
          {...register('password')} 
        />

        <Input 
          label={t('auth.register.confirmPasswordLabel', 'Confirm Password')} 
          type="password" 
          placeholder={t('auth.register.confirmPasswordPlaceholder', '••••••••')}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')} 
        />

        <div className="terms-checkbox">
          <label>
            <input type="checkbox" {...register('terms')} />
            <span>
              {t('auth.register.termsLabel', 'I agree to the Terms of Service and Privacy Policy')}
            </span>
          </label>
          {errors.terms && <span className="error-message">{errors.terms.message}</span>}
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting} className="btn-create-account">
          {t('auth.register.createAccountBtn', 'Create Account')}
          <ArrowRight size={18} />
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

      <div className="register-footer">
        <p>{t('auth.register.alreadyHaveAccount', 'Already have an account?')} <Link to={ROUTES.LOGIN}>{t('auth.register.signIn', 'Log In')}</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
