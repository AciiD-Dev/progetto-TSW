'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);
  const warning = useCallback((msg: string) => addToast(msg, 'warning'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[250px] px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-slide-in ${
              t.type === 'success' ? 'bg-surface-container-high border-primary/30' :
              t.type === 'error' ? 'bg-error/10 border-error/30 text-error' :
              t.type === 'warning' ? 'bg-warning/10 border-warning/30 text-warning' :
              'bg-secondary/10 border-secondary/30 text-secondary'
            }`}
          >
            <span className={`material-symbols-outlined text-lg`}>
              {t.type === 'success' ? 'check_circle' : 
               t.type === 'error' ? 'error' : 
               t.type === 'warning' ? 'warning' : 'info'}
            </span>
            <span className={`text-sm font-medium ${t.type === 'success' ? 'text-on-surface' : ''}`}>
              {t.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

