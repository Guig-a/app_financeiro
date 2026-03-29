'use client';

import { ReactNode, useEffect } from 'react';

type FormModalProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
};

export function FormModal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: FormModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-(--color-border) px-5 py-4">
          <h3 id="form-modal-title" className="text-lg font-semibold">
            {title}
          </h3>
          {description ? (
            <div className="mt-1 text-xs text-(--color-text-muted)">
              {description}
            </div>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <div className="shrink-0 flex justify-end gap-2 border-t border-(--color-border) px-5 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}
