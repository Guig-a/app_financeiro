'use client';

import { FormEvent, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Receipt } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLancamentos } from '../hooks/useLancamentos';
import { useProdutos } from '@/modules/produtos/hooks/useProdutos';
import { usePessoas } from '@/modules/pessoas/hooks/usePessoas';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { FilterBar } from '@/shared/components/filter-bar';
import { Button, EmptyCell, StatusBadge } from '@/shared/components/ui';
import { DataTable, useDataTableState } from '@/shared/components/data-table';
import { Lancamento, LancamentoPayload } from '../types/lancamento.types';
import { labelLancamentoStatus } from '../lib/status-label';
import {
  formatCompetenciaMonthYear,
  formatCurrencyThin,
} from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/api';
import { cn } from '@/shared/lib/utils';
import {
  createLancamento,
  deleteLancamento,
  updateLancamento,
} from '../services/lancamento.service';
import { useToast } from '@/shared/providers/toast-provider';

const LancamentoModals = dynamic(() => import('./LancamentoModals'), {
  ssr: false,
});

function buildColumns(): ColumnDef<Lancamento>[] {
  return [
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      cell: ({ row }) => {
        const v = row.original.descricao?.trim();
        return v ? (
          <span className="max-w-[min(280px,40vw)] truncate" title={v}>
            {v}
          </span>
        ) : (
          <EmptyCell />
        );
      },
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipo = row.original.tipo;
        return (
          <StatusBadge variant={tipo === 'RECEITA' ? 'success' : 'danger'}>
            {tipo === 'RECEITA' ? 'Receita' : 'Despesa'}
          </StatusBadge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        if (!s) return <EmptyCell />;
        const variant =
          s === 'PAGO' ? 'success' : s === 'EM_ATRASO' ? 'danger' : 'warning';
        return (
          <StatusBadge variant={variant}>{labelLancamentoStatus(s)}</StatusBadge>
        );
      },
    },
    {
      accessorKey: 'pessoa',
      header: 'Pessoa',
      cell: ({ row }) => {
        const nome = row.original.pessoa?.nome?.trim();
        return nome ? (
          <span className="max-w-[min(160px,28vw)] truncate" title={nome}>
            {nome}
          </span>
        ) : (
          <EmptyCell />
        );
      },
    },
    {
      accessorKey: 'produto',
      header: 'Produto',
      cell: ({ row }) => {
        const p = row.original.produto;
        if (!p) return <EmptyCell />;
        const label = `${p.nome}${p.codigo ? ` (${p.codigo})` : ''}`;
        return (
          <span className="max-w-[min(200px,32vw)] truncate" title={label}>
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: 'valor',
      header: () => <span className="block w-full text-right">Valor</span>,
      cell: ({ row }) => {
        const tipo = row.original.tipo;
        return (
          <span
            className={cn(
              'block text-right font-numeric tabular-nums',
              tipo === 'RECEITA'
                ? 'text-(--color-finance-positive)'
                : 'text-(--color-finance-negative)',
            )}
          >
            {formatCurrencyThin(row.original.valor)}
          </span>
        );
      },
    },
    {
      accessorKey: 'dataCompetencia',
      header: () => <span className="block w-full text-right">Competência</span>,
      cell: ({ row }) => {
        const f = formatCompetenciaMonthYear(row.original.dataCompetencia);
        return f ? (
          <span className="block text-right text-[11px] font-numeric tabular-nums text-text-muted/85">
            {f}
          </span>
        ) : (
          <EmptyCell />
        );
      },
    },
  ];
}

export function LancamentosView() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isLoading, isError } = useLancamentos();
  const { data: produtos = [] } = useProdutos();
  const { data: pessoas = [] } = usePessoas();
  const {
    page,
    pageSize,
    filters,
    editingRow,
    createOpen,
    setEditingRow,
    onPageChange,
    onFilterChange,
    openCreateModal,
    closeCreateModal,
  } = useDataTableState<Lancamento>();
  const [createForm, setCreateForm] = useState<LancamentoPayload>({
    descricao: '',
    valor: 0,
    tipo: 'DESPESA',
    dataCompetencia: '',
    dataVencimento: '',
    dataQuitacao: '',
  });
  const [editForm, setEditForm] = useState<LancamentoPayload>({
    descricao: '',
    valor: 0,
    tipo: 'DESPESA',
    dataCompetencia: '',
    dataVencimento: '',
    dataQuitacao: '',
  });
  const [deleteTarget, setDeleteTarget] = useState<Lancamento | null>(null);

  const columns = useMemo(() => buildColumns(), []);

  const createMutation = useMutation({
    mutationFn: createLancamento,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      setCreateForm({
        descricao: '',
        valor: 0,
        tipo: 'DESPESA',
        dataCompetencia: '',
        dataVencimento: '',
        dataQuitacao: '',
      });
      closeCreateModal();
      toast.success('Lançamento criado', 'Novo lançamento registrado.');
    },
    onError: (err) => {
      toast.error('Falha ao criar lançamento', getApiErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LancamentoPayload }) =>
      updateLancamento(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      setEditingRow(null);
      toast.success('Lançamento atualizado', 'Alterações aplicadas com sucesso.');
    },
    onError: (err) => {
      toast.error('Falha ao atualizar lançamento', getApiErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLancamento,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      toast.success('Lançamento removido', 'Registro excluído com sucesso.');
    },
    onError: (err) => {
      toast.error('Falha ao excluir lançamento', getApiErrorMessage(err));
    },
  });

  const filteredData = useMemo(() => {
    const search = String(filters.search ?? '').toLowerCase();
    const tipo = String(filters.tipo ?? '');

    return (data ?? []).filter((item) => {
      const matchesSearch = search
        ? (item.descricao ?? '').toLowerCase().includes(search)
        : true;
      const matchesTipo = tipo ? item.tipo === tipo : true;
      return matchesSearch && matchesTipo;
    });
  }, [data, filters.search, filters.tipo]);

  const pagedData = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return filteredData.slice(offset, offset + pageSize);
  }, [filteredData, page, pageSize]);

  const pessoaOptions = useMemo(
    () =>
      pessoas.map((pessoa) => ({
        value: pessoa.id,
        label: pessoa.nome,
      })),
    [pessoas],
  );

  const produtoOptions = useMemo(
    () =>
      produtos.map((produto) => ({
        value: produto.id,
        label: `${produto.nome}${produto.codigo ? ` (${produto.codigo})` : ''}`,
      })),
    [produtos],
  );

  function findProdutoPreco(produtoId?: string) {
    if (!produtoId) return undefined;
    return produtos.find((produto) => produto.id === produtoId)?.preco;
  }

  function normalizePayload(payload: LancamentoPayload): LancamentoPayload {
    const toIsoDateTime = (value?: string) => {
      if (!value) return undefined;
      return value.includes('T') ? value : `${value}T00:00:00.000Z`;
    };

    return {
      ...payload,
      descricao: payload.descricao || undefined,
      pessoaId: payload.pessoaId || undefined,
      produtoId: payload.produtoId || undefined,
      dataCompetencia: toIsoDateTime(payload.dataCompetencia) ?? '',
      dataVencimento: toIsoDateTime(payload.dataVencimento) ?? '',
      dataQuitacao: toIsoDateTime(payload.dataQuitacao),
      valor: Number(payload.valor),
    };
  }

  function extractError(error: unknown) {
    if (error instanceof Error) return error.message;
    return 'Não foi possível concluir a ação.';
  }

  function onSubmitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate(normalizePayload(createForm));
  }

  function onSubmitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingRow) return;
    updateMutation.mutate({
      id: editingRow.id,
      payload: normalizePayload(editForm),
    });
  }

  if (isLoading) return <p className="text-sm">Carregando lançamentos...</p>;
  if (isError) return <ErrorBoundary message="Falha ao carregar lançamentos." />;

  return (
    <section>
      <PageHeader
        title="Lançamentos"
        description="Controle de receitas e despesas"
        icon={Receipt}
        action={
          <Button onClick={openCreateModal}>
            <Plus size={16} className="mr-1" />
            Novo lançamento
          </Button>
        }
      />

      <div className="space-y-4">
        <FilterBar
          filters={[
            {
              key: 'search',
              type: 'text',
              placeholder: 'Buscar lançamento...',
            },
            {
              key: 'tipo',
              type: 'select',
              label: 'Tipo',
              options: [
                { label: 'Receita', value: 'RECEITA' },
                { label: 'Despesa', value: 'DESPESA' },
              ],
            },
          ]}
          filterValues={filters}
          onFilterChange={onFilterChange}
        />

        <DataTable
          data={pagedData}
          columns={columns}
          isLoading={isLoading}
          selectable
          page={page}
          pageSize={pageSize}
          total={filteredData.length}
          onPageChange={onPageChange}
          onEdit={(row) => {
            setEditingRow(row);
            setEditForm({
              descricao: row.descricao ?? '',
              pessoaId: row.pessoaId ?? '',
              produtoId: row.produtoId ?? '',
              valor: row.valor,
              tipo: row.tipo,
              dataCompetencia: row.dataCompetencia.slice(0, 10),
              dataVencimento: row.dataVencimento.slice(0, 10),
              dataQuitacao: row.dataQuitacao?.slice(0, 10) ?? '',
            });
          }}
          onDelete={(row) => setDeleteTarget(row)}
          emptyState={<EmptyState title="Nenhum lançamento encontrado" />}
        />
      </div>

      <LancamentoModals
        createOpen={createOpen}
        editingRow={editingRow}
        createForm={createForm}
        setCreateForm={setCreateForm}
        editForm={editForm}
        setEditForm={setEditForm}
        pessoaOptions={pessoaOptions}
        produtoOptions={produtoOptions}
        findProdutoPreco={findProdutoPreco}
        onCloseCreate={closeCreateModal}
        onCloseEdit={() => setEditingRow(null)}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={onSubmitEdit}
        createPending={createMutation.isPending}
        updatePending={updateMutation.isPending}
        createError={createMutation.error}
        updateError={updateMutation.error}
        extractError={extractError}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        title="Excluir lançamento?"
        description="Esta ação não pode ser desfeita."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
      />
    </section>
  );
}
