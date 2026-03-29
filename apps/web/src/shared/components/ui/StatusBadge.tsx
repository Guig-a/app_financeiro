import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export type StatusBadgeVariant = 'success' | 'danger' | 'warning' | 'neutral';

type StatusBadgeProps = {
  children: ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
};

const variantClass: Record<StatusBadgeVariant, string> = {
  success:
    'border border-[var(--color-finance-positive)]/30 bg-[var(--color-finance-positive)]/14 text-[var(--color-finance-positive)]',
  danger:
    'border border-[var(--color-finance-negative)]/35 bg-[var(--color-finance-negative)]/14 text-[var(--color-finance-negative)]',
  warning:
    'border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/12 text-[var(--color-warning)]',
  neutral:
    'border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]',
};

export function StatusBadge({
  children,
  variant = 'neutral',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide font-numeric',
        variantClass[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
