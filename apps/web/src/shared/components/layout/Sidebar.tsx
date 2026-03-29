'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {
  ChartPieSlice,
  Package,
  Receipt,
  SignOut,
  SquaresFour,
  UserGear,
  UsersThree,
} from '@phosphor-icons/react';
import { routes } from '@/config/routes';
import { logout } from '@/modules/auth/services/auth.service';
import { setFlashToast } from '@/shared/lib/toast';
import type { SessionUser } from '@/shared/lib/auth';
import { Role } from '@/shared/types/role';

type NavItem = {
  href: string;
  label: string;
  icon: typeof ChartPieSlice;
};

function buildNavGroups(showUsuarios: boolean): { title: string; items: NavItem[] }[] {
  const base: { title: string; items: NavItem[] }[] = [
    {
      title: 'VISÃO GERAL',
      items: [
        { href: routes.dashboard, label: 'Dashboard', icon: ChartPieSlice },
      ],
    },
    {
      title: 'FINANCEIRO',
      items: [
        { href: routes.lancamentos, label: 'Lançamentos', icon: Receipt },
        { href: routes.pessoas, label: 'Pessoas', icon: UsersThree },
        { href: routes.produtos, label: 'Produtos', icon: Package },
      ],
    },
  ];
  if (showUsuarios) {
    base.push({
      title: 'CONFIG',
      items: [{ href: routes.usuarios, label: 'Usuários', icon: UserGear }],
    });
  }
  return base;
}

function navActive(pathname: string, href: string): boolean {
  if (href === routes.dashboard) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '?';
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || '?';
}

type SidebarProps = {
  user: SessionUser;
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const tenantLabel = user.tenant?.name ?? 'Organização';
  const groups = useMemo(
    () => buildNavGroups(user.role === Role.MASTER),
    [user.role],
  );

  return (
    <aside className="flex w-64 flex-col border-r border-(--color-border) bg-(--color-surface)">
      <div className="p-4">
        <div className="flex items-start gap-2">
          <SquaresFour
            className="mt-0.5 shrink-0 text-(--color-primary)"
            size={22}
            weight="duotone"
          />
          <div>
            <h1 className="text-base font-semibold leading-tight">Financeiro</h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-(--color-text-muted)">
              Contas a pagar
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full bg-(--color-finance-positive) shadow-[0_0_8px_rgba(82,183,136,0.45)]"
            aria-hidden
          />
          <p className="min-w-0 truncate text-sm font-medium text-(--color-text)">
            {tenantLabel}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-6 px-3 pb-4">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted) opacity-80">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = navActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                        active
                          ? 'border border-primary/45 bg-primary/12 text-(--color-text)'
                          : 'border border-transparent text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text)'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          active
                            ? 'text-(--color-primary)'
                            : 'text-(--color-text-muted)'
                        }
                        weight={active ? 'fill' : 'regular'}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-(--color-border) p-3">
        <div className="flex items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/25 text-sm font-semibold text-(--color-primary)"
            aria-hidden
          >
            {initialsFromEmail(user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-(--color-text)">
              {user.email}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-(--color-text-muted)">
              {user.role}
            </p>
          </div>
          <button
            type="button"
            title="Sair"
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-(--color-text-muted) transition-colors hover:bg-red-500/10 hover:text-red-400/90"
            onClick={async () => {
              try {
                await logout();
                setFlashToast({
                  title: 'Logout realizado',
                  description: 'Você saiu da sua sessão com segurança.',
                  variant: 'info',
                });
              } catch {
                setFlashToast({
                  title: 'Sessão encerrada',
                  description: 'Sua sessão já havia expirado.',
                  variant: 'warning',
                });
              }
              window.location.href = routes.login;
            }}
          >
            <SignOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}
