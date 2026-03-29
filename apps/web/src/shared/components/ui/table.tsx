import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="table-scroll w-full overflow-x-auto rounded-lg border border-(--color-border) bg-(--color-surface)">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<'thead'>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<'tbody'>) {
  return <tbody className={cn('divide-y divide-(--color-border)', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'group h-10 transition-colors hover:bg-(--color-surface-muted)',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-10 px-3 text-left align-middle text-[11px] font-semibold tracking-[0.06em] text-text-muted/80',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.ComponentProps<'td'>) {
  return <td className={cn('px-3 py-0 align-middle', className)} {...props} />;
}
