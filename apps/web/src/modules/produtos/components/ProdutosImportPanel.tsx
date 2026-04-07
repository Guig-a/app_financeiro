'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { FileArrowDown, UploadSimple } from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui';
import { apiFetchBlob, getApiErrorMessage } from '@/shared/lib/api';
import { useToast } from '@/shared/providers/toast-provider';
import {
  applyProdutosImport,
  previewProdutosImport,
} from '../services/produto.service';
import type { ImportRowResolution } from '../types/produto-import.types';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function statusLabel(status: string) {
  if (status === 'novo') return 'Novo';
  if (status === 'existente') return 'Já existe';
  return 'Inválido';
}

export function ProdutosImportPanel() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [resolutions, setResolutions] = useState<
    Record<string, ImportRowResolution>
  >({});

  const previewMutation = useMutation({
    mutationFn: (file: File) => previewProdutosImport(file),
    onSuccess: (data) => {
      const next: Record<string, ImportRowResolution> = {};
      data.rows.forEach((r) => {
        if (r.status === 'existente') {
          next[String(r.rowIndex)] = 'update';
        }
      });
      setResolutions(next);
    },
    onError: (err) => {
      setResolutions({});
      toast.error('Falha ao analisar CSV', getApiErrorMessage(err));
    },
  });

  const applyMutation = useMutation({
    mutationFn: ({
      file,
      res,
    }: {
      file: File;
      res: Record<string, ImportRowResolution>;
    }) => applyProdutosImport(file, res),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success(
        'Importação concluída',
        `Criados: ${result.created}, atualizados: ${result.updated}, ignorados: ${result.ignored}.`,
      );
      setImportFile(null);
      setResolutions({});
      previewMutation.reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err) => {
      toast.error('Importação não aplicada', getApiErrorMessage(err));
    },
  });

  const preview = previewMutation.data;

  const canApply =
    Boolean(importFile) &&
    preview?.valid === true &&
    !previewMutation.isPending &&
    !applyMutation.isPending;

  async function onDownloadTemplate() {
    try {
      const blob = await apiFetchBlob('/produtos/import/csv-template');
      triggerDownload(blob, 'produtos-modelo.csv');
    } catch (err) {
      toast.error('Download', getApiErrorMessage(err));
    }
  }

  function onPickFile() {
    fileInputRef.current?.click();
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Formato inválido', 'Envie apenas arquivos .csv');
      event.target.value = '';
      return;
    }
    setImportFile(file);
    previewMutation.mutate(file);
  }

  function setResolution(rowIndex: number, value: ImportRowResolution) {
    setResolutions((prev) => ({
      ...prev,
      [String(rowIndex)]: value,
    }));
  }

  function onApply() {
    if (!importFile || !preview?.valid) return;
    applyMutation.mutate({ file: importFile, res: resolutions });
  }

  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDownloadTemplate}
        >
          <FileArrowDown size={16} className="mr-1" />
          Exportar modelo
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onPickFile}>
          <UploadSimple size={16} className="mr-1" />
          Importar produtos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {previewMutation.isPending ? (
        <p className="mt-3 text-sm text-(--color-text-muted)">
          Analisando arquivo…
        </p>
      ) : null}

      {preview?.blockingReason ? (
        <p className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-(--color-danger)">
          {preview.blockingReason}
        </p>
      ) : null}

      {preview && preview.rows.length > 0 ? (
        <div className="mt-4 space-y-3">
          {!preview.valid && !preview.blockingReason ? (
            <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-(--color-danger)">
              Existem linhas inválidas. Corrija o CSV — a importação só é permitida
              quando todas as linhas forem válidas (all or nothing).
            </p>
          ) : null}

          <div className="max-h-[min(360px,50vh)] overflow-auto rounded-md border border-(--color-border)">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-(--color-surface-muted)">
                <tr>
                  <th className="border-b border-(--color-border) px-2 py-2 font-medium">
                    Linha
                  </th>
                  <th className="border-b border-(--color-border) px-2 py-2 font-medium">
                    Status
                  </th>
                  <th className="border-b border-(--color-border) px-2 py-2 font-medium">
                    Nome
                  </th>
                  <th className="border-b border-(--color-border) px-2 py-2 font-medium">
                    Código
                  </th>
                  <th className="border-b border-(--color-border) px-2 py-2 font-medium">
                    Unid.
                  </th>
                  <th className="border-b border-(--color-border) px-2 py-2 font-medium">
                    Preço
                  </th>
                  <th className="border-b border-(--color-border) px-2 py-2 font-medium">
                    Duplicado
                  </th>
                  <th className="border-b border-(--color-border) px-2 py-2 font-medium">
                    Erros
                  </th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => {
                  const invalid = row.errors.length > 0;
                  return (
                    <tr
                      key={row.rowIndex}
                      className={
                        invalid
                          ? 'bg-danger/10'
                          : 'odd:bg-(--color-surface) even:bg-surface-muted/40'
                      }
                    >
                      <td className="border-b border-(--color-border) px-2 py-1.5 font-numeric">
                        {row.lineNumber}
                      </td>
                      <td className="border-b border-(--color-border) px-2 py-1.5">
                        {statusLabel(row.status)}
                      </td>
                      <td className="border-b border-(--color-border) px-2 py-1.5">
                        {row.nome || '—'}
                      </td>
                      <td className="border-b border-(--color-border) px-2 py-1.5 font-numeric">
                        {row.codigo || '—'}
                      </td>
                      <td className="border-b border-(--color-border) px-2 py-1.5 uppercase">
                        {row.unidade || '—'}
                      </td>
                      <td className="border-b border-(--color-border) px-2 py-1.5 font-numeric">
                        {row.preco || '—'}
                      </td>
                      <td className="border-b border-(--color-border) px-2 py-1.5">
                        {row.status === 'existente' ? (
                          <select
                            className="h-8 max-w-[140px] rounded border border-(--color-border) bg-(--color-surface) px-1 text-xs"
                            value={
                              resolutions[String(row.rowIndex)] ?? 'update'
                            }
                            onChange={(e) =>
                              setResolution(
                                row.rowIndex,
                                e.target.value as ImportRowResolution,
                              )
                            }
                            disabled={!preview.valid}
                          >
                            <option value="update">Atualizar</option>
                            <option value="ignore">Ignorar</option>
                          </select>
                        ) : (
                          <span className="text-(--color-text-muted)">—</span>
                        )}
                      </td>
                      <td className="border-b border-(--color-border) px-2 py-1.5 text-(--color-danger)">
                        {row.errors.length ? row.errors.join(' ') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!canApply}
              onClick={onApply}
            >
              {applyMutation.isPending ? 'Aplicando…' : 'Confirmar importação'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
