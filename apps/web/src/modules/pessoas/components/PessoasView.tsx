'use client';

import { FormEvent, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, UsersThree } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePessoas } from '../hooks/usePessoas';
import { Pessoa, PessoaPayload, PessoaTipo } from '../types/pessoa.types';
import { createPessoa, deletePessoa, updatePessoa } from '../services/pessoa.service';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { FilterBar } from '@/shared/components/filter-bar';
import { Button, EmptyCell, StatusBadge } from '@/shared/components/ui';
import { DataTable, useDataTableState } from '@/shared/components/data-table';
import { useToast } from '@/shared/providers/toast-provider';

const PessoasModals = dynamic(() => import('./PessoasModals'), { ssr: false });

const tipoOptions = [
  { label: 'CLIENTE', value: 'CLIENTE' },
  { label: 'FORNECEDOR', value: 'FORNECEDOR' },
  { label: 'AMBOS', value: 'AMBOS' },
];

function tipoVariant(t: PessoaTipo): 'neutral' | 'warning' | 'success' {
  if (t === 'AMBOS') return 'warning';
  if (t === 'FORNECEDOR') return 'success';
  return 'neutral';
}

function buildColumns(): ColumnDef<Pessoa>[] {
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
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <StatusBadge variant={tipoVariant(row.original.tipo)}>{row.original.tipo}</StatusBadge>
      ),
    },
    {
      accessorKey: 'documento',
      header: 'Documento',
      cell: ({ row }) => {
        const d = row.original.documento?.trim();
        return d ? (
          <span className="font-numeric">{d}</span>
        ) : (
          <EmptyCell />
        );
      },
    },
  ];
}

export function PessoasView() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isLoading, isError } = usePessoas();
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
  } = useDataTableState<Pessoa>();
  const [createForm, setCreateForm] = useState<PessoaPayload>({
    nome: '',
    tipo: 'CLIENTE',
    documento: '',
  });
  const [editForm, setEditForm] = useState<PessoaPayload>({
    nome: '',
    tipo: 'CLIENTE',
    documento: '',
  });
  const [deleteTarget, setDeleteTarget] = useState<Pessoa | null>(null);

  const columns = useMemo(() => buildColumns(), []);

  const createMutation = useMutation({
    mutationFn: createPessoa,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      setCreateForm({ nome: '', tipo: 'CLIENTE', documento: '' });
      closeCreateModal();
      toast.success('Pessoa criada', 'Registro incluído com sucesso.');
    },
    onError: () => {
      toast.error('Falha ao criar pessoa', 'Verifique os dados e tente novamente.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PessoaPayload }) =>
      updatePessoa(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      setEditingRow(null);
      toast.success('Pessoa atualizada', 'Alterações salvas com sucesso.');
    },
    onError: () => {
      toast.error('Falha ao atualizar pessoa', 'Não foi possível salvar.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePessoa,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      toast.success('Pessoa removida', 'Registro excluído com sucesso.');
    },
    onError: () => {
      toast.error('Falha ao excluir pessoa', 'Tente novamente em instantes.');
    },
  });

  const filteredData = useMemo(() => {
    const search = String(filters.search ?? '').toLowerCase();
    const tipo = String(filters.tipo ?? '');
    return (data ?? []).filter((item) => {
      const matchesSearch = search
        ? item.nome.toLowerCase().includes(search) ||
          (item.documento ?? '').toLowerCase().includes(search)
        : true;
      const matchesTipo = tipo ? item.tipo === tipo : true;
      return matchesSearch && matchesTipo;
    });
  }, [data, filters.search, filters.tipo]);

  const pagedData = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return filteredData.slice(offset, offset + pageSize);
  }, [filteredData, page, pageSize]);

  function normalizePayload(payload: PessoaPayload): PessoaPayload {
    return {
      ...payload,
      documento: payload.documento?.trim() ? payload.documento : undefined,
    };
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

  if (isLoading) return <p className="text-sm">Carregando pessoas...</p>;
  if (isError) return <ErrorBoundary message="Falha ao carregar pessoas." />;

  return (
    <section>
      <PageHeader
        title="Pessoas"
        description="Clientes e fornecedores vinculáveis aos lançamentos"
        icon={UsersThree}
        action={
          <Button onClick={openCreateModal}>
            <Plus size={16} className="mr-1" />
            Nova pessoa
          </Button>
        }
      />

      <div className="space-y-4">
        <FilterBar
          filters={[
            {
              key: 'search',
              type: 'text',
              placeholder: 'Buscar nome/documento...',
            },
            {
              key: 'tipo',
              type: 'select',
              label: 'Tipo',
              options: tipoOptions,
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
              tipo: row.tipo,
              documento: row.documento ?? '',
            });
          }}
          onDelete={(row) => setDeleteTarget(row)}
          emptyState={<EmptyState title="Nenhuma pessoa encontrada" />}
        />
      </div>

      <PessoasModals
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
      />

      <ConfirmDialog
        open={deleteTarget != null}
        title="Excluir pessoa?"
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
