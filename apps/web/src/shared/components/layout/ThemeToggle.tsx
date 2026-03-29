'use client';

import { Moon, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = stored ? stored === 'dark' : prefersDark;
    root.classList.toggle('dark', shouldUseDark);
    setDark(shouldUseDark);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    const root = document.documentElement;
    root.classList.toggle('dark', nextDark);
    localStorage.setItem(STORAGE_KEY, nextDark ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
      aria-label="Alternar tema"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {dark ? 'Claro' : 'Escuro'}
    </button>
  );
}
