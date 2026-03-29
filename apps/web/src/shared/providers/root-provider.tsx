'use client';

import { ToastProvider } from './toast-provider';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
