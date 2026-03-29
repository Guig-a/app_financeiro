export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** BRL com espaço fino entre símbolo e valor (IBM Plex Mono via classe `font-numeric`). */
export function formatCurrencyThin(value: number): string {
  return formatCurrency(value).replace(/^R\$\s?/, 'R$\u2009');
}

const MONTHS_PT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

/** Competência a partir de ISO UTC (ex.: 2026-03-28T00:00:00.000Z → mar/2026). */
export function formatCompetenciaMonthYear(iso: string | undefined | null): string {
  if (!iso?.trim()) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONTHS_PT[d.getUTCMonth()]}/${d.getUTCFullYear()}`;
}
