'use client';

import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';

export default function AppError() {
  return (
    <ErrorBoundary
      title="Erro ao carregar página"
      message="Atualize a tela para tentar novamente."
    />
  );
}
