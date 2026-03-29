import { cn } from '@/shared/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-[var(--color-surface-muted)]',
        className,
      )}
    />
  );
}
