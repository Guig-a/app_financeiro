import { cn } from '@/shared/lib/utils';

type EmptyCellProps = {
  className?: string;
};

export function EmptyCell({ className }: EmptyCellProps) {
  return (
    <span className={cn('text-text-muted/50', className)} aria-hidden>
      —
    </span>
  );
}
