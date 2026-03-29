/** Converte `Decimal` do Prisma (ou número) para número em respostas JSON. */
export function decimalToNumber(
  v: unknown,
): number | undefined {
  if (v == null) return undefined;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (
    typeof v === 'object' &&
    v !== null &&
    'toNumber' in v &&
    typeof (v as { toNumber: () => number }).toNumber === 'function'
  ) {
    return (v as { toNumber: () => number }).toNumber();
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
