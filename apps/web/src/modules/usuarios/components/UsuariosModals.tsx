'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { FormModal } from '@/shared/components/layout/FormModal';
import { Button, Input, Select } from '@/shared/components/ui';
import type { Usuario, UsuarioPayload } from '../types/usuario.types';

export type UsuariosModalsProps = {
  createOpen: boolean;
  editingRow: Usuario | null;
  createForm: Required<UsuarioPayload>;
  setCreateForm: Dispatch<SetStateAction<Required<UsuarioPayload>>>;
  editForm: UsuarioPayload;
  setEditForm: Dispatch<SetStateAction<UsuarioPayload>>;
  onCloseCreate: () => void;
  onCloseEdit: () => void;
  onSubmitCreate: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitEdit: (event: FormEvent<HTMLFormElement>) => void;
  createPending: boolean;
  updatePending: boolean;
  createError: unknown;
  updateError: unknown;
  extractError: (error: unknown) => string;
};

export default function UsuariosModals({
  createOpen,
  editingRow,
  createForm,
  setCreateForm,
  editForm,
  setEditForm,
  onCloseCreate,
  onCloseEdit,
  onSubmitCreate,
  onSubmitEdit,
  createPending,
  updatePending,
  createError,
  updateError,
  extractError,
}: UsuariosModalsProps) {
  return (
    <>
      <FormModal
        open={createOpen}
        title="Novo usuário"
        onClose={onCloseCreate}
        footer={
          <>
            <Button type="button" variant="outline" onClick={onCloseCreate}>
              Cancelar
            </Button>
            <Button type="submit" form="usuario-create-form" disabled={createPending}>
              Criar
            </Button>
          </>
        }
      >
        <form id="usuario-create-form" onSubmit={onSubmitCreate} className="space-y-3">
          <Input
            type="email"
            placeholder="E-mail"
            value={createForm.email}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={createForm.password}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            required
          />
          <Select
            value={createForm.role}
            options={[
              { label: 'MASTER', value: 'MASTER' },
              { label: 'USER', value: 'USER' },
            ]}
            onValueChange={(value) =>
              setCreateForm((prev) => ({
                ...prev,
                role: value as 'MASTER' | 'USER',
              }))
            }
          />
          {createError ? (
            <p className="text-sm text-(--color-danger)">{extractError(createError)}</p>
          ) : null}
        </form>
      </FormModal>

      <FormModal
        open={Boolean(editingRow)}
        title="Editar usuário"
        description={
          editingRow ? (
            <>
              ID: <span className="font-numeric">{editingRow.id}</span>
            </>
          ) : null
        }
        onClose={onCloseEdit}
        footer={
          <>
            <Button type="button" variant="outline" onClick={onCloseEdit}>
              Cancelar
            </Button>
            <Button type="submit" form="usuario-edit-form" disabled={updatePending}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="usuario-edit-form" onSubmit={onSubmitEdit} className="space-y-3">
          <Input
            type="email"
            placeholder="E-mail"
            value={editForm.email}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            required
          />
          <Input
            type="password"
            placeholder="Nova senha (opcional)"
            value={editForm.password ?? ''}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
          />
          <Select
            value={editForm.role}
            options={[
              { label: 'MASTER', value: 'MASTER' },
              { label: 'USER', value: 'USER' },
            ]}
            onValueChange={(value) =>
              setEditForm((prev) => ({
                ...prev,
                role: value as 'MASTER' | 'USER',
              }))
            }
          />
          {updateError ? (
            <p className="text-sm text-(--color-danger)">{extractError(updateError)}</p>
          ) : null}
        </form>
      </FormModal>
    </>
  );
}
