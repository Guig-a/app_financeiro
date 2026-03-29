export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

const FLASH_TOAST_KEY = 'financeiro:flash-toast';

export function setFlashToast(input: ToastInput) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(FLASH_TOAST_KEY, JSON.stringify(input));
}

export function consumeFlashToast(): ToastInput | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(FLASH_TOAST_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(FLASH_TOAST_KEY);
  try {
    return JSON.parse(raw) as ToastInput;
  } catch {
    return null;
  }
}
