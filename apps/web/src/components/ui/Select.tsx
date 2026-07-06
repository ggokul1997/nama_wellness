import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, helperText, children, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {label && <label className="label">{label}</label>}
        <select
          ref={ref}
          className={`input ${className}`}
          {...props}
        >
          {children}
        </select>
        {helperText && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
