'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { FormModal } from '@/shared/components/layout/FormModal';
import { Button, Input, Select } from '@/shared/components/ui';
import type { Pessoa, PessoaPayload, PessoaTipo } from '../types/pessoa.types';

const tipoOptions = [
  { label: 'CLIENTE', value: 'CLIENTE' },
  { label: 'FORNECEDOR', value: 'FORNECEDOR' },
  { label: 'AMBOS', value: 'AMBOS' },
];

export type PessoasModalsProps = {
  createOpen: boolean;
  editingRow: Pessoa | null;
  createForm: PessoaPayload;
  setCreateForm: Dispatch<SetStateAction<PessoaPayload>>;
  editForm: PessoaPayload;
  setEditForm: Dispatch<SetStateAction<PessoaPayload>>;
  onCloseCreate: () => void;
  onCloseEdit: () => void;
  onSubmitCreate: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitEdit: (event: FormEvent<HTMLFormElement>) => void;
  createPending: boolean;
  updatePending: boolean;
};

export default function PessoasModals({
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
}: PessoasModalsProps) {
  return (
    <>
      <FormModal
        open={createOpen}
        title="Nova pessoa"
        onClose={onCloseCreate}
        footer={
          <>
            <Button type="button" variant="outline" onClick={onCloseCreate}>
              Cancelar
            </Button>
            <Button type="submit" form="pessoa-create-form" disabled={createPending}>
              Criar
            </Button>
          </>
        }
      >
        <form id="pessoa-create-form" onSubmit={onSubmitCreate} className="space-y-3">
          <Input
            placeholder="Nome"
            value={createForm.nome}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, nome: event.target.value }))
            }
            required
          />
          <Select
            value={createForm.tipo}
            options={tipoOptions}
            onValueChange={(value) =>
              setCreateForm((prev) => ({
                ...prev,
                tipo: value as PessoaTipo,
              }))
            }
          />
          <Input
            placeholder="Documento (CPF/CNPJ)"
            value={createForm.documento ?? ''}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                documento: event.target.value,
              }))
            }
          />
        </form>
      </FormModal>

      <FormModal
        open={Boolean(editingRow)}
        title="Editar pessoa"
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
            <Button type="submit" form="pessoa-edit-form" disabled={updatePending}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="pessoa-edit-form" onSubmit={onSubmitEdit} className="space-y-3">
          <Input
            placeholder="Nome"
            value={editForm.nome}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, nome: event.target.value }))
            }
            required
          />
          <Select
            value={editForm.tipo}
            options={tipoOptions}
            onValueChange={(value) =>
              setEditForm((prev) => ({
                ...prev,
                tipo: value as PessoaTipo,
              }))
            }
          />
          <Input
            placeholder="Documento (CPF/CNPJ)"
            value={editForm.documento ?? ''}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                documento: event.target.value,
              }))
            }
          />
        </form>
      </FormModal>
    </>
  );
}
