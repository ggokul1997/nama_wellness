import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helperText, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {label && <label className="label">{label}</label>}
        <input
          ref={ref}
          className={`input ${className}`}
          {...props}
        />
        {helperText && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
