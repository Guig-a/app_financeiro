'use client';

import { ReactNode, useMemo, useState } from 'react';
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import {
  Button,
  Checkbox,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui';

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  selectable?: boolean;
  emptyState?: ReactNode;
  isLoading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
};

function isNumericLike(value: unknown) {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  if (!value.trim()) return false;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return true;
  if (/^[\d\-:/.]+$/.test(value) && value.length >= 6) return true;
  if (/^[a-f0-9-]{8,}$/i.test(value)) return true;
  return false;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  selectable = false,
  emptyState,
  isLoading = false,
  page,
  pageSize,
  total,
  onPageChange,
  onEdit,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const withSelectionAndActions = useMemo(() => {
    const nextColumns = [...columns] as ColumnDef<TData, TValue>[];

    if (selectable) {
      nextColumns.unshift({
        id: '__select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
            aria-label="Selecionar linhas"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(value)}
            aria-label="Selecionar linha"
          />
        ),
      } as ColumnDef<TData, TValue>);
    }

    if (onEdit || onDelete) {
      nextColumns.push({
        id: '__actions',
        header: () => <span className="sr-only">Ações</span>,
        size: 88,
        cell: ({ row }: { row: Row<TData> }) => (
          <div className="flex h-10 w-full min-w-[88px] max-w-[88px] items-center justify-end gap-0.5 pr-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Editar"
                onClick={() => onEdit(row.original)}
              >
                <PencilSimple size={16} />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Excluir"
                className="text-(--color-danger) hover:bg-red-500/10 hover:text-(--color-danger)"
                onClick={() => onDelete(row.original)}
              >
                <Trash size={16} />
              </Button>
            ) : null}
          </div>
        ),
      } as ColumnDef<TData, TValue>);
    }

    return nextColumns;
  }, [columns, onDelete, onEdit, selectable]);

  const table = useReactTable({
    data,
    columns: withSelectionAndActions,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: selectable,
  });

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.id === '__actions' &&
                      'sticky right-0 z-10 w-[88px] min-w-[88px] max-w-[88px] border-l border-border/60 bg-(--color-surface) p-0',
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: Math.max(4, pageSize) }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {table.getAllLeafColumns().map((column) => (
                    <TableCell key={`${column.id}-${index}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const rawValue = row.getValue(cell.column.id);
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          isNumericLike(rawValue) && 'font-numeric',
                          cell.column.id === '__actions' &&
                            'sticky right-0 z-10 w-[88px] min-w-[88px] max-w-[88px] border-l border-border/60 bg-(--color-surface) p-0',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {!isLoading && table.getRowModel().rows.length === 0
        ? emptyState ?? (
            <p className="text-sm text-(--color-text-muted)">
              Nenhum registro encontrado.
            </p>
          )
        : null}

      <div className="flex items-center justify-between">
        <p className="text-xs text-(--color-text-muted)">
          Página <span className="font-numeric">{page}</span> de{' '}
          <span className="font-numeric">{totalPages}</span> · Total{' '}
          <span className="font-numeric">{total}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}

type DataTableStateOptions = {
  initialPage?: number;
  pageSize?: number;
  initialFilters?: Record<string, unknown>;
};

function isSameUnknownValue(a: unknown, b: unknown) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((value, index) => value === b[index]);
  }
  if (
    a &&
    b &&
    typeof a === 'object' &&
    typeof b === 'object' &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const aRecord = a as Record<string, unknown>;
    const bRecord = b as Record<string, unknown>;
    const aKeys = Object.keys(aRecord);
    const bKeys = Object.keys(bRecord);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => aRecord[key] === bRecord[key]);
  }
  return false;
}

export function useDataTableState<TData = unknown>({
  initialPage = 1,
  pageSize = 20,
  initialFilters = {},
}: DataTableStateOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<Record<string, unknown>>(initialFilters);
  const [editingRow, setEditingRow] = useState<TData | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return {
    page,
    pageSize,
    filters,
    editingRow,
    createOpen,
    setEditingRow,
    onPageChange: setPage,
    onFilterChange: (key: string, value: unknown) => {
      setFilters((prev) => {
        if (isSameUnknownValue(prev[key], value)) return prev;
        return { ...prev, [key]: value };
      });
      setPage((prev) => (prev === 1 ? prev : 1));
    },
    openCreateModal: () => setCreateOpen(true),
    closeCreateModal: () => setCreateOpen(false),
  };
}
