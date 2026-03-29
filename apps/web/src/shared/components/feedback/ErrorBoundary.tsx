'use client';

type ErrorBoundaryProps = {
  title?: string;
  message?: string;
};

export function ErrorBoundary({
  title = 'Algo deu errado',
  message = 'Tente novamente em instantes.',
}: ErrorBoundaryProps) {
  return (
    <div className="rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 p-4 text-sm">
      <p className="font-medium text-[var(--color-danger)]">{title}</p>
      <p className="mt-1 text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}
