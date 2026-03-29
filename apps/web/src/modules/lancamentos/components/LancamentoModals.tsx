'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { FormModal } from '@/shared/components/layout/FormModal';
import { Button, Input, Select } from '@/shared/components/ui';
import type { Lancamento, LancamentoPayload } from '../types/lancamento.types';

export type LancamentoModalsProps = {
  createOpen: boolean;
  editingRow: Lancamento | null;
  createForm: LancamentoPayload;
  setCreateForm: Dispatch<SetStateAction<LancamentoPayload>>;
  editForm: LancamentoPayload;
  setEditForm: Dispatch<SetStateAction<LancamentoPayload>>;
  pessoaOptions: { label: string; value: string }[];
  produtoOptions: { label: string; value: string }[];
  findProdutoPreco: (produtoId?: string) => number | undefined;
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

export default function LancamentoModals({
  createOpen,
  editingRow,
  createForm,
  setCreateForm,
  editForm,
  setEditForm,
  pessoaOptions,
  produtoOptions,
  findProdutoPreco,
  onCloseCreate,
  onCloseEdit,
  onSubmitCreate,
  onSubmitEdit,
  createPending,
  updatePending,
  createError,
  updateError,
  extractError,
}: LancamentoModalsProps) {
  return (
    <>
      <FormModal
        open={createOpen}
        title="Novo lançamento"
        onClose={onCloseCreate}
        footer={
          <>
            <Button type="button" variant="outline" onClick={onCloseCreate}>
              Cancelar
            </Button>
            <Button type="submit" form="lancamento-create-form" disabled={createPending}>
              Criar
            </Button>
          </>
        }
      >
        <form id="lancamento-create-form" onSubmit={onSubmitCreate} className="space-y-3">
          <Input
            placeholder="Descrição"
            value={createForm.descricao ?? ''}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                descricao: event.target.value,
              }))
            }
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Valor"
            value={createForm.valor}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                valor: Number(event.target.value),
              }))
            }
            required
          />
          <Select
            value={createForm.pessoaId ?? ''}
            options={pessoaOptions}
            placeholder="Pessoa (opcional)"
            onValueChange={(value) =>
              setCreateForm((prev) => ({
                ...prev,
                pessoaId: value || undefined,
              }))
            }
          />
          <Select
            value={createForm.produtoId ?? ''}
            options={produtoOptions}
            placeholder="Produto (opcional)"
            onValueChange={(value) => {
              const preco = findProdutoPreco(value || undefined);
              setCreateForm((prev) => ({
                ...prev,
                produtoId: value || undefined,
                valor: preco != null ? preco : prev.valor,
              }));
            }}
          />
          <Select
            value={createForm.tipo}
            options={[
              { label: 'Receita', value: 'RECEITA' },
              { label: 'Despesa', value: 'DESPESA' },
            ]}
            onValueChange={(value) =>
              setCreateForm((prev) => ({
                ...prev,
                tipo: value as 'RECEITA' | 'DESPESA',
              }))
            }
          />
          <Input
            type="date"
            value={createForm.dataCompetencia}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                dataCompetencia: event.target.value,
              }))
            }
            required
          />
          <Input
            type="date"
            value={createForm.dataVencimento}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                dataVencimento: event.target.value,
              }))
            }
            required
          />
          <Input
            type="date"
            value={createForm.dataQuitacao ?? ''}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                dataQuitacao: event.target.value,
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
        title="Editar lançamento"
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
            <Button type="submit" form="lancamento-edit-form" disabled={updatePending}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="lancamento-edit-form" onSubmit={onSubmitEdit} className="space-y-3">
          <Input
            placeholder="Descrição"
            value={editForm.descricao ?? ''}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                descricao: event.target.value,
              }))
            }
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Valor"
            value={editForm.valor}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                valor: Number(event.target.value),
              }))
            }
            required
          />
          <Select
            value={editForm.pessoaId ?? ''}
            options={pessoaOptions}
            placeholder="Pessoa (opcional)"
            onValueChange={(value) =>
              setEditForm((prev) => ({
                ...prev,
                pessoaId: value || undefined,
              }))
            }
          />
          <Select
            value={editForm.produtoId ?? ''}
            options={produtoOptions}
            placeholder="Produto (opcional)"
            onValueChange={(value) => {
              const preco = findProdutoPreco(value || undefined);
              setEditForm((prev) => ({
                ...prev,
                produtoId: value || undefined,
                valor: preco != null ? preco : prev.valor,
              }));
            }}
          />
          <Select
            value={editForm.tipo}
            options={[
              { label: 'Receita', value: 'RECEITA' },
              { label: 'Despesa', value: 'DESPESA' },
            ]}
            onValueChange={(value) =>
              setEditForm((prev) => ({
                ...prev,
                tipo: value as 'RECEITA' | 'DESPESA',
              }))
            }
          />
          <Input
            type="date"
            value={editForm.dataCompetencia}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                dataCompetencia: event.target.value,
              }))
            }
            required
          />
          <Input
            type="date"
            value={editForm.dataVencimento}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                dataVencimento: event.target.value,
              }))
            }
            required
          />
          <Input
            type="date"
            value={editForm.dataQuitacao ?? ''}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                dataQuitacao: event.target.value,
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
