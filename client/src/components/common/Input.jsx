import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import './Input.css';

const Input = forwardRef(({ label, error, leftIcon, rightIcon, rightLabel, className, ...props }, ref) => {
  return (
    <div className={clsx('input-group', className)}>
      {(label || rightLabel) && (
        <div className="input-header">
          {label && <label className="input-label">{label}</label>}
          {rightLabel && <span className="input-right-label">{rightLabel}</span>}
        </div>
      )}
      <div className="input-wrapper">
        {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
        <input 
          ref={ref}
          className={clsx(
            'input-field', 
            error && 'input-error',
            leftIcon && 'has-left-icon',
            rightIcon && 'has-right-icon'
          )}
          {...props} 
        />
        {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
