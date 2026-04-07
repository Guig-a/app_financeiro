import { Readable } from 'stream';
import * as csv from 'csv-parser';
import { UnidadeProduto } from '../../../prisma/generated/client';

export function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

/** Separador usado no ficheiro modelo exportado — Excel em PT-BR abre cada campo numa coluna. */
export const CSV_TEMPLATE_DELIMITER = ';' as const;

export type CsvColumnDelimiter = ',' | ';';

/**
 * Infere o separador de colunas da primeira linha (vírgula ou ponto e vírgula).
 * Excel em português costuma gravar com `;`; outros ambientes com `,`.
 */
export function detectSeparator(firstLine: string): CsvColumnDelimiter {
  const comma = (firstLine.match(/,/g) ?? []).length;
  const semi = (firstLine.match(/;/g) ?? []).length;
  return semi > comma ? ';' : ',';
}

/**
 * Divide uma linha CSV pelo delimitador, respeitando campos entre aspas.
 */
function splitCsvLineFields(
  line: string,
  delimiter: CsvColumnDelimiter,
): string[] {
  const out: string[] = [];
  let field = '';
  let i = 0;
  let inQuotes = false;
  while (i < line.length) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }
    if (c === delimiter && !inQuotes) {
      out.push(field);
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }
  out.push(field);
  return out;
}

export function parseUnidade(raw: unknown): UnidadeProduto | undefined {
  if (raw == null || raw === '') return undefined;
  const u = String(raw).trim().toUpperCase();
  const aliases: Record<string, UnidadeProduto> = {
    KG: UnidadeProduto.KG,
    UN: UnidadeProduto.UN,
    UNIDADE: UnidadeProduto.UN,
    CX: UnidadeProduto.CAIXA,
    CAIXA: UnidadeProduto.CAIXA,
    FARDO: UnidadeProduto.FARDO,
    FD: UnidadeProduto.FARDO,
  };
  if (aliases[u]) return aliases[u];
  const values = Object.values(UnidadeProduto) as string[];
  if (values.includes(u)) return u as UnidadeProduto;
  return undefined;
}

export async function parseCsvBuffer(
  buffer: Buffer,
): Promise<Record<string, string>[]> {
  const text = stripBom(buffer.toString('utf8'));
  const firstNl = text.indexOf('\n');
  const firstLine =
    firstNl === -1 ? text : text.slice(0, firstNl).replace(/\r$/, '');
  const separator = detectSeparator(firstLine);

  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];
    Readable.from(text)
      .pipe(
        csv({
          separator,
          mapHeaders: ({ header }) =>
            String(header ?? '')
              .trim()
              .toLowerCase(),
        }),
      )
      .on('data', (data: Record<string, string>) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err: Error) => reject(err));
  });
}

export const REQUIRED_CSV_HEADERS = ['nome', 'codigo', 'unidade', 'preco'] as const;

export function validateCsvHeaderKeys(keys: string[]): string | null {
  const set = new Set(keys.map((k) => k.trim().toLowerCase()));
  for (const h of REQUIRED_CSV_HEADERS) {
    if (!set.has(h)) {
      return `Cada campo deve estar na sua própria coluna (separador vírgula ou ponto e vírgula). Cabeçalhos: ${REQUIRED_CSV_HEADERS.join(', ')}. Baixe o modelo CSV.`;
    }
  }
  return null;
}

/** Primeira linha do arquivo para cabeçalhos quando não há linhas de dados. */
export function getHeaderKeysFromFirstLine(text: string): string[] {
  const rawLine = text.split(/\r?\n/)[0] ?? '';
  const line = stripBom(rawLine);
  const sep = detectSeparator(line);
  return splitCsvLineFields(line, sep).map((h) =>
    h.trim().toLowerCase().replace(/^"|"$/g, ''),
  );
}
