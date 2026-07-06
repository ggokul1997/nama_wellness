import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', fullWidth, style, children, ...props }, ref) => {
    
    let defaultStyle: React.CSSProperties = { ...style };
    
    if (variant === 'primary') {
      defaultStyle = { ...defaultStyle, background: 'var(--brand-600)' };
    }
    
    if (fullWidth) {
      defaultStyle = { ...defaultStyle, width: '100%' };
    }

    return (
      <button
        ref={ref}
        className={`btn btn-${variant} ${className}`}
        style={defaultStyle}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
