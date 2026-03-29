import { cookies } from 'next/headers';

export type SessionUser = {
  id: string;
  email: string;
  tenantId: string;
  role: string;
  tenant?: { name: string; slug: string };
};

const API_BASE_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

export async function getServerSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return (await response.json()) as SessionUser;
}
