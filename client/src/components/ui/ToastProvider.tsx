import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import {
  ToastContext,
  type ToastContextValue,
  type ToastOptions,
  type ToastRecord,
  type ToastTone,
} from '@/components/ui/toast-context';
import { cn } from '@/lib/utils/cn';

export interface ToastProviderProps {
  children: ReactNode;
}

const toneClasses: Record<ToastTone, string> = {
  info: 'border-burgundy-soft',
  success: 'border-burgundy',
  warning: 'border-rose',
  error: 'border-rose',
};

const toneIcons: Record<ToastTone, ReactNode> = {
  info: <Info aria-hidden="true" size={18} />,
  success: <CheckCircle2 aria-hidden="true" size={18} />,
  warning: <AlertTriangle aria-hidden="true" size={18} />,
  error: <AlertCircle aria-hidden="true" size={18} />,
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timersRef = useRef(new Map<string, number>());
  const counterRef = useRef(0);

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      counterRef.current += 1;
      const id = `toast-${counterRef.current}`;
      const toast: ToastRecord = {
        id,
        title: options.title,
        description: options.description,
        tone: options.tone ?? 'info',
        duration: options.duration ?? 5000,
      };

      setToasts((current) => [...current, toast].slice(-5));

      if (toast.duration > 0) {
        const timer = window.setTimeout(() => dismissToast(id), toast.duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document === 'undefined'
        ? null
        : createPortal(
            <div
              aria-live="polite"
              aria-relevant="additions text"
              className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
            >
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  role={toast.tone === 'error' || toast.tone === 'warning' ? 'alert' : 'status'}
                  className={cn(
                    'ds-toast-enter pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 border-line bg-cream p-4 shadow-overlay',
                    toneClasses[toast.tone],
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={
                      toast.tone === 'warning' || toast.tone === 'error'
                        ? 'text-rose'
                        : 'text-burgundy'
                    }
                  >
                    {toneIcons[toast.tone]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-dark">{toast.title}</p>
                    {toast.description ? (
                      <p className="mt-1 text-xs leading-5 text-muted">{toast.description}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="rounded-md p-1 text-muted transition-colors duration-200 hover:bg-burgundy-weak hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
                    aria-label="Dismiss notification"
                  >
                    <X aria-hidden="true" size={15} />
                  </button>
                </div>
              ))}
            </div>,
            document.body,
          )}
    </ToastContext.Provider>
  );
}
