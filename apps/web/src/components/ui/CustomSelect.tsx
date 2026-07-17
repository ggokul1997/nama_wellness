'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  className?: string;
  required?: boolean;
  error?: boolean;
}

export function CustomSelect({ value, onChange, options, className = '', error }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minWidth: 0 }}>
      <div 
        className={`input ${className}`} 
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '0.5rem',
          minWidth: 0,
          border: error ? '1px solid var(--error)' : undefined
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
          <path fill="#9ca3af" d="M6 8L1 3h10z" />
        </svg>
      </div>

      {isOpen && (
        <div className="glass-card" style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          marginTop: '0.25rem', zIndex: 1000,
          maxHeight: '200px', overflowY: 'auto',
          background: 'var(--surface-overlay)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column'
        }}>
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: opt.value === value ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: 'var(--text-primary)',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                fontSize: '0.9375rem'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = opt.value === value ? 'rgba(255,255,255,0.05)' : 'transparent')}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
