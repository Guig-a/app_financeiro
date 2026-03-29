import type { ComponentType, ReactNode } from 'react';

type IconComponent = ComponentType<{
  size?: number;
  className?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}>;

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: IconComponent;
  action?: ReactNode;
};

export function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-md border border-(--color-border) text-(--color-text-muted)"
            aria-hidden
          >
            <Icon size={16} weight="regular" />
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-(--color-text-muted)">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
