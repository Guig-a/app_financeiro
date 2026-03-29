'use client';

import { useEffect, useMemo, useState } from 'react';
import { Funnel } from '@phosphor-icons/react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { hasActiveFilters } from '@/shared/lib/filter-utils';
import { cn } from '@/shared/lib/utils';
import { Button, Input, MultiSelect, Select } from '@/shared/components/ui';
import type {
  FilterConfig,
  TextFilterConfig,
} from './filter-types';

export type FilterBarProps = {
  filters: FilterConfig[];
  filterValues: Record<string, unknown>;
  onFilterChange: (key: string, value: unknown) => void;
};

function splitFilters(filters: FilterConfig[]) {
  const texts = filters.filter((f): f is TextFilterConfig => f.type === 'text');
  const search = texts[0];
  const panel: FilterConfig[] = [
    ...texts.slice(1),
    ...filters.filter((f) => f.type !== 'text'),
  ];
  return { search, panel };
}

export function FilterBar({
  filters,
  filterValues,
  onFilterChange,
}: FilterBarProps) {
  const { search, panel } = useMemo(() => splitFilters(filters), [filters]);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!search) return;
    setDraft((prev) => ({
      ...prev,
      [search.key]: String(filterValues[search.key] ?? ''),
    }));
  }, [search, filterValues]);

  const debouncedSearch = useDebounce(
    search ? (draft[search.key] ?? '') : '',
    300,
  );

  useEffect(() => {
    if (!search) return;
    if (String(filterValues[search.key] ?? '') !== debouncedSearch) {
      onFilterChange(search.key, debouncedSearch);
    }
  }, [debouncedSearch, search, filterValues, onFilterChange]);

  const active = hasActiveFilters(filterValues);
  const hasPanel = panel.length > 0;

  function clearAll() {
    filters.forEach((filter) => {
      if (filter.type === 'multiselect') {
        onFilterChange(filter.key, []);
      } else if (filter.type === 'date-range') {
        onFilterChange(filter.key, { from: '', to: '' });
      } else {
        onFilterChange(filter.key, '');
      }
    });
    if (search) {
      setDraft((prev) => ({ ...prev, [search.key]: '' }));
    }
  }

  if (!search && !hasPanel) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {search ? (
          <Input
            className="min-w-[200px] flex-1"
            value={draft[search.key] ?? ''}
            placeholder={search.placeholder ?? 'Buscar...'}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                [search.key]: event.target.value,
              }))
            }
          />
        ) : null}

        {active ? (
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
            Limpar filtros
          </Button>
        ) : null}

        {hasPanel ? (
          <Button
            type="button"
            variant="outline"
            className={cn(
              'shrink-0 gap-2',
              active &&
                'border-[var(--color-primary)] text-[var(--color-primary)]',
            )}
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
          >
            <Funnel size={16} weight="regular" aria-hidden />
            Filtros
          </Button>
        ) : null}
      </div>

      {hasPanel && expanded ? (
        <div className="grid gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {panel.map((filter) => {
            const label = filter.label ?? filter.key;
            if (filter.type === 'text') {
              return (
                <div key={filter.key} className={cn('space-y-1', filter.className)}>
                  <p className="text-[11px] font-medium tracking-[0.06em] text-[var(--color-text-muted)]/80">
                    {label}
                  </p>
                  <Input
                    value={String(filterValues[filter.key] ?? '')}
                    placeholder={filter.placeholder ?? 'Buscar...'}
                    onChange={(event) =>
                      onFilterChange(filter.key, event.target.value)
                    }
                  />
                </div>
              );
            }

            if (filter.type === 'select') {
              return (
                <div key={filter.key} className={cn('space-y-1', filter.className)}>
                  <p className="text-[11px] font-medium tracking-[0.06em] text-[var(--color-text-muted)]/80">
                    {label}
                  </p>
                  <Select
                    value={String(filterValues[filter.key] ?? '')}
                    options={filter.options}
                    placeholder={filter.placeholder ?? 'Selecione'}
                    onValueChange={(value) =>
                      onFilterChange(filter.key, value || undefined)
                    }
                  />
                </div>
              );
            }

            if (filter.type === 'multiselect') {
              return (
                <div key={filter.key} className={cn('space-y-1', filter.className)}>
                  <p className="text-[11px] font-medium tracking-[0.06em] text-[var(--color-text-muted)]/80">
                    {label}
                  </p>
                  <MultiSelect
                    values={
                      Array.isArray(filterValues[filter.key])
                        ? (filterValues[filter.key] as string[])
                        : []
                    }
                    options={filter.options}
                    onValuesChange={(values) =>
                      onFilterChange(filter.key, values)
                    }
                  />
                </div>
              );
            }

            const range =
              (filterValues[filter.key] as { from?: string; to?: string }) ?? {};
            return (
              <div key={filter.key} className={cn('space-y-1', filter.className)}>
                <p className="text-[11px] font-medium tracking-[0.06em] text-[var(--color-text-muted)]/80">
                  {label}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={range.from ?? ''}
                    onChange={(event) =>
                      onFilterChange(filter.key, {
                        ...range,
                        from: event.target.value,
                      })
                    }
                  />
                  <Input
                    type="date"
                    value={range.to ?? ''}
                    onChange={(event) =>
                      onFilterChange(filter.key, {
                        ...range,
                        to: event.target.value,
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
