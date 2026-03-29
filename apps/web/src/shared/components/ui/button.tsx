import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' &&
            'bg-[var(--color-primary)] text-[var(--color-primary-contrast)] hover:opacity-90',
          variant === 'outline' &&
            'border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]',
          variant === 'ghost' &&
            'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]',
          variant === 'destructive' &&
            'bg-[var(--color-danger)] text-white hover:opacity-90',
          size === 'default' && 'h-9 px-3 py-2',
          size === 'sm' && 'h-8 px-2.5',
          size === 'icon' && 'h-8 w-8',
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
