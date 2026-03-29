'use client';

import { FormEvent, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, UserGear } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUsuarios } from '../hooks/useUsuarios';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { FilterBar } from '@/shared/components/filter-bar';
import { Button, StatusBadge } from '@/shared/components/ui';
import {
  DataTable,
  useDataTableState,
} from '@/shared/components/data-table';
import { Usuario, UsuarioPayload } from '../types/usuario.types';
import {
  createUsuario,
  deleteUsuario,
  updateUsuario,
} from '../services/usuario.service';
import { useToast } from '@/shared/providers/toast-provider';

const UsuariosModals = dynamic(() => import('./UsuariosModals'), { ssr: false });

function buildColumns(): ColumnDef<Usuario>[] {
  return [
    {
      accessorKey: 'email',
      header: 'E-mail',
      cell: ({ row }) => (
        <span className="max-w-[min(320px,50vw)] truncate" title={row.original.email}>
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <StatusBadge variant={row.original.role === 'MASTER' ? 'warning' : 'neutral'}>
          {row.original.role}
        </StatusBadge>
      ),
    },
    {
      accessorKey: 'tenantId',
      header: 'Tenant',
      cell: ({ row }) => (
        <span className="font-numeric text-[var(--color-text-muted)]">
          {row.original.tenantId}
        </span>
      ),
    },
  ];
}

export function UsuariosView() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isLoading, isError } = useUsuarios();
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
  } = useDataTableState<Usuario>();
  const [createForm, setCreateForm] = useState<Required<UsuarioPayload>>({
    email: '',
    password: '',
    role: 'USER',
  });
  const [editForm, setEditForm] = useState<UsuarioPayload>({
    email: '',
    password: '',
    role: 'USER',
  });
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);

  const columns = useMemo(() => buildColumns(), []);

  const createMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setCreateForm({ email: '', password: '', role: 'USER' });
      closeCreateModal();
      toast.success('Usuário criado', 'Novo usuário incluído no tenant.');
    },
    onError: () => {
      toast.error('Falha ao criar usuário', 'Verifique permissões e dados.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UsuarioPayload }) =>
      updateUsuario(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setEditingRow(null);
      toast.success('Usuário atualizado', 'Alterações salvas com sucesso.');
    },
    onError: () => {
      toast.error('Falha ao atualizar usuário', 'Não foi possível salvar.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuário removido', 'Registro excluído do tenant.');
    },
    onError: () => {
      toast.error('Falha ao excluir usuário', 'Tente novamente em instantes.');
    },
  });

  const filteredData = useMemo(() => {
    const search = String(filters.search ?? '').toLowerCase();
    const role = String(filters.role ?? '');
    return (data ?? []).filter((item) => {
      const matchesSearch = search
        ? item.email.toLowerCase().includes(search)
        : true;
      const matchesRole = role ? item.role === role : true;
      return matchesSearch && matchesRole;
    });
  }, [data, filters.role, filters.search]);

  const pagedData = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return filteredData.slice(offset, offset + pageSize);
  }, [filteredData, page, pageSize]);

  function extractError(error: unknown) {
    if (error instanceof Error) return error.message;
    return 'Não foi possível concluir a ação.';
  }

  function normalizePayload(payload: UsuarioPayload): UsuarioPayload {
    return {
      email: payload.email,
      role: payload.role,
      password: payload.password?.trim() ? payload.password : undefined,
    };
  }

  function onSubmitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      email: createForm.email,
      password: createForm.password,
      role: createForm.role,
    });
  }

  function onSubmitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingRow) return;
    updateMutation.mutate({
      id: editingRow.id,
      payload: normalizePayload(editForm),
    });
  }

  if (isLoading) return <p className="text-sm">Carregando usuários...</p>;
  if (isError) return <ErrorBoundary message="Falha ao carregar usuários." />;

  return (
    <section>
      <PageHeader
        title="Usuários"
        description="Acesso dos usuários no tenant"
        icon={UserGear}
        action={
          <Button onClick={openCreateModal}>
            <Plus size={16} className="mr-1" />
            Novo usuário
          </Button>
        }
      />

      <div className="space-y-4">
        <FilterBar
          filters={[
            {
              key: 'search',
              type: 'text',
              placeholder: 'Buscar e-mail...',
            },
            {
              key: 'role',
              type: 'select',
              label: 'Role',
              options: [
                { label: 'MASTER', value: 'MASTER' },
                { label: 'USER', value: 'USER' },
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
              email: row.email,
              role: row.role,
              password: '',
            });
          }}
          onDelete={(row) => setDeleteTarget(row)}
          emptyState={<EmptyState title="Nenhum usuário encontrado" />}
        />
      </div>

      <UsuariosModals
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
      />

      <ConfirmDialog
        open={deleteTarget != null}
        title="Excluir usuário?"
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
