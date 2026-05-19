import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Home, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import bgImage from '../../../assets/images/register-bg.png';
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
    console.log({ ...data, role });
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="register-split-layout">
      {/* Left Column: Image Area */}
      <div className="register-image-section" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="image-overlay">
          <div className="overlay-content">
            <div className="overlay-logo">
              {/* Simplified mock logo representing the one in Figma */}
              <svg width="200" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 30L40 30L60 20L140 20L160 30L200 30" stroke="white" strokeWidth="4"/>
                <path d="M60 25L140 25" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <h2>Find Your Perfect Stay</h2>
            <p>Join Smart Stay today and experience a modern, frictionless approach to long-term rentals.</p>
          </div>
        </div>
      </div>

      {/* Right Column: Form Area */}
      <div className="register-form-section">
        <div className="register-form-container">
          <div className="register-header">
            <h1>Create an Account</h1>
            <p>Welcome! Let's get you set up.</p>
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
      </div>
    </div>
  );
};

export default RegisterPage;
