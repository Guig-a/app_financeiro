'use client';

import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { consumeFlashToast, ToastInput, ToastVariant } from '@/shared/lib/toast';

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
  durationMs: number;
};

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const styleByVariant: Record<
  ToastVariant,
  { ring: string; icon: React.ComponentType<{ size?: number; weight?: 'fill' }> }
> = {
  success: { ring: 'ring-[var(--color-success)]', icon: CheckCircle },
  error: { ring: 'ring-[var(--color-danger)]', icon: WarningCircle },
  warning: { ring: 'ring-[var(--color-warning)]', icon: Warning },
  info: { ring: 'ring-[var(--color-info)]', icon: Info },
};

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const nextToast: ToastItem = {
      id: randomId(),
      variant: input.variant ?? 'info',
      durationMs: input.durationMs ?? 3500,
      ...input,
    };
    setToasts((prev) => [...prev.slice(-3), nextToast]);
  }, []);

  useEffect(() => {
    const flash = consumeFlashToast();
    if (flash) showToast(flash);
  }, [showToast]);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), toast.durationMs),
    );
    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [removeToast, toasts]);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (title, description) =>
        showToast({ title, description, variant: 'success' }),
      error: (title, description) =>
        showToast({ title, description, variant: 'error' }),
      warning: (title, description) =>
        showToast({ title, description, variant: 'warning' }),
      info: (title, description) =>
        showToast({ title, description, variant: 'info' }),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const visual = styleByVariant[toast.variant];
          const Icon = visual.icon;
          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg ring-1',
                visual.ring,
              )}
            >
              <div className="flex items-start gap-2">
                <Icon size={18} weight="fill" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {toast.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
                  aria-label="Fechar notificação"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
