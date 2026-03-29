export function hasActiveFilters(values: Record<string, unknown> = {}) {
  return Object.values(values).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (!value) return false;
    if (typeof value === 'object') {
      const range = value as { from?: string; to?: string };
      return Boolean(range.from || range.to);
    }
    return String(value).trim().length > 0;
  });
}
