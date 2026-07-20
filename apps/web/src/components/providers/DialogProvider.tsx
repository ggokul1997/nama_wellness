'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type DialogType = 'alert' | 'confirm' | 'prompt';

interface DialogOptions {
  title: string;
  message: string | ReactNode;
  type?: DialogType; // Defaults to 'alert'
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

interface DialogContextValue {
  alert: (options: string | Omit<DialogOptions, 'type'>) => Promise<void>;
  confirm: (options: string | Omit<DialogOptions, 'type'>) => Promise<boolean>;
  prompt: (options: string | Omit<DialogOptions, 'type'>) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [resolvePromise, setResolvePromise] = useState<((value: any) => void) | null>(null);

  const showAlert = useCallback((opts: string | Omit<DialogOptions, 'type'>) => {
    return new Promise<void>((resolve) => {
      const parsedOptions = typeof opts === 'string' ? { title: 'Notification', message: opts } : opts;
      setOptions({ ...parsedOptions, type: 'alert', confirmText: parsedOptions.confirmText || 'OK' });
      setResolvePromise(() => resolve as any);
      setIsOpen(true);
    });
  }, []);

  const showConfirm = useCallback((opts: string | Omit<DialogOptions, 'type'>) => {
    return new Promise<boolean>((resolve) => {
      const parsedOptions = typeof opts === 'string' ? { title: 'Confirm Action', message: opts } : opts;
      setOptions({ ...parsedOptions, type: 'confirm', confirmText: parsedOptions.confirmText || 'Confirm', cancelText: parsedOptions.cancelText || 'Cancel' });
      setResolvePromise(() => resolve as any);
      setIsOpen(true);
    });
  }, []);

  const showPrompt = useCallback((opts: string | Omit<DialogOptions, 'type'>) => {
    return new Promise<string | null>((resolve) => {
      const parsedOptions = typeof opts === 'string' ? { title: 'Input Required', message: opts } : opts;
      setOptions({ ...parsedOptions, type: 'prompt', confirmText: parsedOptions.confirmText || 'Submit', cancelText: parsedOptions.cancelText || 'Cancel' });
      setInputValue(parsedOptions.defaultValue || '');
      setResolvePromise(() => resolve as any);
      setIsOpen(true);
    });
  }, []);

  const handleClose = (isConfirmed: boolean) => {
    setIsOpen(false);
    if (resolvePromise) {
      if (options?.type === 'prompt') {
        resolvePromise(isConfirmed ? inputValue : null);
      } else {
        resolvePromise(isConfirmed);
      }
      setResolvePromise(null);
    }
  };

  return (
    <DialogContext.Provider value={{ alert: showAlert, confirm: showConfirm, prompt: showPrompt }}>
      {children}
      
      {isOpen && options && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div className="glass-card" style={{
            background: 'var(--surface-base)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            width: '90%', maxWidth: '400px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {options.title}
            </h3>
            
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
              {options.message}
            </div>

            {options.type === 'prompt' && (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={options.placeholder}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleClose(true);
                  if (e.key === 'Escape') handleClose(false);
                }}
                className="input"
                style={{ marginTop: '0.5rem', width: '100%', boxSizing: 'border-box' }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              {(options.type === 'confirm' || options.type === 'prompt') && (
                <button 
                  onClick={() => handleClose(false)}
                  className="btn btn-ghost"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {options.cancelText}
                </button>
              )}
              <button 
                onClick={() => handleClose(true)}
                className={`btn ${options.isDestructive ? 'btn-danger' : 'btn-primary'}`}
                style={{ padding: '0.5rem 1.25rem' }}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </DialogContext.Provider>
  );
}
