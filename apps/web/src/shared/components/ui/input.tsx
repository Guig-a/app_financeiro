import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]',
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';
