type KpiCardProps = {
  label: string;
  value: number | string;
  tone?: 'default' | 'success' | 'danger' | 'neutral';
  hint?: string;
};

export function KpiCard({
  label,
  value,
  tone = 'default',
  hint,
}: KpiCardProps) {
  const borderTopClass =
    tone === 'success'
      ? 'border-t-[var(--color-finance-positive)]'
      : tone === 'danger'
        ? 'border-t-[var(--color-finance-negative)]'
        : 'border-t-[var(--color-border)]';

  const valueTone =
    tone === 'success'
      ? 'text-[var(--color-finance-positive)]'
      : tone === 'danger'
        ? 'text-[var(--color-finance-negative)]'
        : 'text-[var(--color-text)]';

  return (
    <div
      className={`rounded-lg border border-[var(--color-border)] border-t-2 ${borderTopClass} bg-[var(--color-surface)] p-4`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </p>
      <p
        className={`font-numeric-lg mt-2 text-2xl font-semibold tabular-nums ${valueTone}`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
