import { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, subtitle, icon, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-(--color-border) p-8 text-center">
      {icon ? (
        <div className="mb-3 flex justify-center text-(--color-text-muted)">{icon}</div>
      ) : null}
      <h3 className="text-lg font-medium">{title}</h3>
      {subtitle ? (
        <p className="mt-2 text-sm text-(--color-text-muted)">{subtitle}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
