import { createContext, useContext } from 'react';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
}

export interface ToastRecord {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
}

export interface ToastContextValue {
  toasts: readonly ToastRecord[];
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
