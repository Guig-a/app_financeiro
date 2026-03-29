import * as React from 'react';
import { cn } from '@/shared/lib/utils';

type CheckboxProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
};

export function Checkbox({
  checked = false,
  onCheckedChange,
  disabled,
  className,
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      className={cn(
        'h-4 w-4 rounded border border-[var(--color-border)] accent-[var(--color-primary)]',
        className,
      )}
      {...props}
    />
  );
}
