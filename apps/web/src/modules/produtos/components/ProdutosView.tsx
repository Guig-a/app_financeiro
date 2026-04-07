'use client';

import { FormEvent, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ColumnDef } from '@tanstack/react-table';
import { Package, Plus } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProdutos } from '../hooks/useProdutos';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { FilterBar } from '@/shared/components/filter-bar';
import { Button, EmptyCell } from '@/shared/components/ui';
import {
  DataTable,
  useDataTableState,
} from '@/shared/components/data-table';
import { getApiErrorMessage } from '@/shared/lib/api';
import { formatCurrencyThin } from '@/shared/lib/format';
import {
  Produto,
  ProdutoFormState,
  ProdutoPayload,
  UNIDADES_PRODUTO,
  type UnidadeProduto,
} from '../types/produto.types';
import {
  createProduto,
  deleteProduto,
  updateProduto,
} from '../services/produto.service';
import { useToast } from '@/shared/providers/toast-provider';
import { useAuthSession } from '@/shared/providers/auth-session-provider';
import { Role } from '@/shared/types/role';

const ProdutosModals = dynamic(() => import('./ProdutosModals'), { ssr: false });
const ProdutosImportPanel = dynamic(
  () =>
    import('./ProdutosImportPanel').then((m) => ({
      default: m.ProdutosImportPanel,
    })),
  { ssr: false },
);

function buildColumns(): ColumnDef<Produto>[] {
  return [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => {
        const v = row.original.nome?.trim();
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
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ row }) => {
        const c = row.original.codigo?.trim();
        return c ? (
          <span className="font-numeric">{c}</span>
        ) : (
          <EmptyCell />
        );
      },
    },
    {
      accessorKey: 'unidade',
      header: 'Unid.',
      cell: ({ row }) => {
        const u = row.original.unidade;
        return u ? (
          <span className="font-numeric text-[11px] uppercase">{u}</span>
        ) : (
          <EmptyCell />
        );
      },
    },
    {
      accessorKey: 'preco',
      header: () => <span className="block w-full text-right">Preço</span>,
      cell: ({ row }) =>
        row.original.preco != null ? (
          <span className="block text-right font-numeric tabular-nums text-[var(--color-text)]">
            {formatCurrencyThin(row.original.preco)}
          </span>
        ) : (
          <EmptyCell />
        ),
    },
  ];
}

export function ProdutosView() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuthSession();
  const { data, isLoading, isError } = useProdutos();
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
  } = useDataTableState<Produto>();
  const [createForm, setCreateForm] = useState<ProdutoFormState>({
    nome: '',
    codigo: '',
    unidade: '',
    preco: undefined,
  });
  const [editForm, setEditForm] = useState<ProdutoFormState>({
    nome: '',
    codigo: '',
    unidade: '',
    preco: undefined,
  });
  const [deleteTarget, setDeleteTarget] = useState<Produto | null>(null);

  const columns = useMemo(() => buildColumns(), []);

  const createMutation = useMutation({
    mutationFn: createProduto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setCreateForm({
        nome: '',
        codigo: '',
        unidade: '',
        preco: undefined,
      });
      closeCreateModal();
      toast.success('Produto criado', 'Registro incluído com sucesso.');
    },
    onError: (err) => {
      toast.error('Falha ao criar produto', getApiErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProdutoPayload }) =>
      updateProduto(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setEditingRow(null);
      toast.success('Produto atualizado', 'Alterações salvas com sucesso.');
    },
    onError: (err) => {
      toast.error('Falha ao atualizar produto', getApiErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto removido', 'O registro foi excluído.');
    },
    onError: (err) => {
      toast.error('Não foi possível excluir', getApiErrorMessage(err));
    },
  });

  const filteredData = useMemo(() => {
    const search = String(filters.search ?? '').toLowerCase();
    return (data ?? []).filter((item) =>
      search
        ? item.nome.toLowerCase().includes(search) ||
          (item.codigo ?? '').toLowerCase().includes(search)
        : true,
    );
  }, [data, filters.search]);

  const pagedData = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return filteredData.slice(offset, offset + pageSize);
  }, [filteredData, page, pageSize]);

  function parseOptionalNumber(value: string) {
    if (!value.trim()) return undefined;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? undefined : numeric;
  }

  function extractError(error: unknown) {
    if (error instanceof Error) return error.message;
    return 'Não foi possível concluir a ação.';
  }

  function narrowUnidade(u: string): UnidadeProduto | undefined {
    return UNIDADES_PRODUTO.includes(u as UnidadeProduto)
      ? (u as UnidadeProduto)
      : undefined;
  }

  function onSubmitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      ...createForm,
      codigo: createForm.codigo || undefined,
      unidade: narrowUnidade(createForm.unidade),
    });
  }

  function onSubmitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingRow) return;
    updateMutation.mutate({
      id: editingRow.id,
      payload: {
        ...editForm,
        codigo: editForm.codigo || undefined,
        unidade: narrowUnidade(editForm.unidade),
      },
    });
  }

  if (isLoading) return <p className="text-sm">Carregando produtos...</p>;
  if (isError) return <ErrorBoundary message="Falha ao carregar produtos." />;

  return (
    <section>
      <PageHeader
        title="Produtos"
        description="Cadastro de produtos"
        icon={Package}
        action={
          <Button onClick={openCreateModal}>
            <Plus size={16} className="mr-1" />
            Novo produto
          </Button>
        }
      />

      <div className="space-y-4">
        {user?.role === Role.MASTER ? <ProdutosImportPanel /> : null}

        <FilterBar
          filters={[
            {
              key: 'search',
              type: 'text',
              placeholder: 'Buscar nome/código...',
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
              nome: row.nome,
              codigo: row.codigo ?? '',
              unidade: row.unidade ?? '',
              preco:
                row.preco != null && typeof row.preco === 'number'
                  ? row.preco
                  : row.preco != null
                    ? Number(row.preco)
                    : undefined,
            });
          }}
          onDelete={(row) => setDeleteTarget(row)}
          emptyState={<EmptyState title="Nenhum produto encontrado" />}
        />
      </div>

      <ProdutosModals
        createOpen={createOpen}
        editingRow={editingRow}
        createForm={createForm}
        setCreateForm={setCreateForm}
        editForm={editForm}
        setEditForm={setEditForm}
        onCloseCreate={closeCreateModal}
        onCloseEdit={() => setEditingRow(null)}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={onSubmitEdit}
        createPending={createMutation.isPending}
        updatePending={updateMutation.isPending}
        createError={createMutation.error}
        updateError={updateMutation.error}
        extractError={extractError}
        parseOptionalNumber={parseOptionalNumber}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        title="Excluir produto?"
        description="Esta ação não pode ser desfeita."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </section>
  );
}
