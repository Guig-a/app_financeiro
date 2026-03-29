import * as React from 'react';
import { cn } from '@/shared/lib/utils';

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
};

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Selecione',
  className,
}: SelectProps) {
  return (
    <select
      value={value ?? ''}
      onChange={(event) => onValueChange?.(event.target.value)}
      className={cn(
        'h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]',
        className,
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

type MultiSelectProps = {
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  options: SelectOption[];
  className?: string;
};

export function MultiSelect({
  values = [],
  onValuesChange,
  options,
  className,
}: MultiSelectProps) {
  return (
    <select
      multiple
      value={values}
      onChange={(event) => {
        const nextValues = Array.from(event.target.selectedOptions).map(
          (option) => option.value,
        );
        onValuesChange?.(nextValues);
      }}
      className={cn(
        'min-h-20 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]',
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
