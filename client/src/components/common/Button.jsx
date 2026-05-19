import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  isLoading = false,
  className,
  disabled,
  ...props 
}) => {
  return (
    <button
      className={clsx(
        'base-btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="btn-spinner" size={16} />}
      {children}
    </button>
  );
};

export default Button;
