import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Home, ArrowRight } from 'lucide-react';
import { supabase } from '../../../config/supabase';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import './RegisterPage.css';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
});

const RegisterPage = () => {
  const [role, setRole] = useState('TENANT');
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false }
  });

  const onSubmit = async (data) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            fullName: data.fullName,
            phone: data.phone,
            role: role
          }
        }
      });

      if (error) throw error;
      
      navigate(ROUTES.VERIFY_OTP, { state: { email: data.email, type: 'signup' } });
    } catch (error) {
      console.error(error);
      alert(error.message || 'Registration failed');
    }
  };

  return (
    <div className="register-form-container">
      <div className="register-header">
        <h1>Create an Account</h1>
        <p>Join our community and find your ideal rental room today.</p>
      </div>

      <div className="role-selector">
        <p className="role-label">I am a...</p>
        <div className="role-tabs">
          <button 
            type="button"
            className={`role-tab ${role === 'TENANT' ? 'active' : ''}`}
            onClick={() => setRole('TENANT')}
          >
            <User size={18} />
            <span className="role-text">Tenant</span>
          </button>
          <button 
            type="button"
            className={`role-tab ${role === 'LANDLORD' ? 'active' : ''}`}
            onClick={() => setRole('LANDLORD')}
          >
            <Home size={18} />
            <span className="role-text">Landlord</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="register-form">
        <Input 
          label="Full Name" 
          type="text" 
          placeholder="John Doe"
          error={errors.fullName?.message}
          {...register('fullName')} 
        />

        <Input 
          label="Email Address" 
          type="email" 
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register('email')} 
        />

        <Input 
          label="Phone Number" 
          type="tel" 
          placeholder="+1 (555) 000-0000"
          error={errors.phone?.message}
          {...register('phone')} 
        />
        
        <Input 
          label="Password" 
          type="password" 
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')} 
        />

        <div className="terms-checkbox">
          <label>
            <input type="checkbox" {...register('terms')} />
            <span>
              I agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>.
            </span>
          </label>
          {errors.terms && <span className="error-message">{errors.terms.message}</span>}
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting} className="btn-create-account">
          Create Account
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="register-footer">
        <p>Already have an account? <Link to={ROUTES.LOGIN}>Log In</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
