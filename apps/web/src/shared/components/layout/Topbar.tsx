import { ThemeToggle } from './ThemeToggle';

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-end border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
      <ThemeToggle />
    </header>
  );
}
