'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { FormModal } from '@/shared/components/layout/FormModal';
import { Button, Input } from '@/shared/components/ui';
import type { Produto, ProdutoPayload } from '../types/produto.types';

export type ProdutosModalsProps = {
  createOpen: boolean;
  editingRow: Produto | null;
  createForm: ProdutoPayload;
  setCreateForm: Dispatch<SetStateAction<ProdutoPayload>>;
  editForm: ProdutoPayload;
  setEditForm: Dispatch<SetStateAction<ProdutoPayload>>;
  onCloseCreate: () => void;
  onCloseEdit: () => void;
  onSubmitCreate: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitEdit: (event: FormEvent<HTMLFormElement>) => void;
  createPending: boolean;
  updatePending: boolean;
  createError: unknown;
  updateError: unknown;
  extractError: (error: unknown) => string;
  parseOptionalNumber: (value: string) => number | undefined;
};

export default function ProdutosModals({
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
  parseOptionalNumber,
}: ProdutosModalsProps) {
  return (
    <>
      <FormModal
        open={createOpen}
        title="Novo produto"
        onClose={onCloseCreate}
        footer={
          <>
            <Button type="button" variant="outline" onClick={onCloseCreate}>
              Cancelar
            </Button>
            <Button type="submit" form="produto-create-form" disabled={createPending}>
              Criar
            </Button>
          </>
        }
      >
        <form id="produto-create-form" onSubmit={onSubmitCreate} className="space-y-3">
          <Input
            placeholder="Nome"
            value={createForm.nome}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, nome: event.target.value }))
            }
            required
          />
          <Input
            placeholder="Código"
            value={createForm.codigo ?? ''}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                codigo: event.target.value,
              }))
            }
          />
          <Input
            placeholder="Unidade (UN, KG...)"
            value={createForm.unidade ?? ''}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                unidade: event.target.value,
              }))
            }
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Preço"
            value={createForm.preco ?? ''}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                preco: parseOptionalNumber(event.target.value),
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
        title="Editar produto"
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
            <Button type="submit" form="produto-edit-form" disabled={updatePending}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="produto-edit-form" onSubmit={onSubmitEdit} className="space-y-3">
          <Input
            placeholder="Nome"
            value={editForm.nome}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, nome: event.target.value }))
            }
            required
          />
          <Input
            placeholder="Código"
            value={editForm.codigo ?? ''}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, codigo: event.target.value }))
            }
          />
          <Input
            placeholder="Unidade"
            value={editForm.unidade ?? ''}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, unidade: event.target.value }))
            }
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Preço"
            value={editForm.preco ?? ''}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                preco: parseOptionalNumber(event.target.value),
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
