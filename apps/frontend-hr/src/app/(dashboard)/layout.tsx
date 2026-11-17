import { cookies } from 'next/headers';
import Sidebar from '@/components/Sidebar';
import { CurrentUserProvider } from '@/components/CurrentUser';
import { AUTH_COOKIE_NAME, SERVER_API_URL } from '@/lib/config';
import type { CurrentUser } from '@/lib/types';

/**
 * Resolves the signed-in user for display. The id and role come from the JWT payload
 * (the backend verifies the token on every API call); the name is looked up from the API.
 */
async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    const current: CurrentUser = { id: payload.sub, role: payload.role, name: '', email: '' };

    const res = await fetch(`${SERVER_API_URL}/user/${payload.sub}`, {
      headers: { Cookie: `${AUTH_COOKIE_NAME}=${token}` },
      cache: 'no-store',
    }).catch(() => null);

    if (res?.ok) {
      const user = await res.json();
      current.name = user.name ?? '';
      current.email = user.email ?? '';
    }
    return current;
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <CurrentUserProvider user={user}>
      <div className="box-border flex min-h-screen flex-wrap items-stretch bg-gray-100 text-gray-900">
        <Sidebar />
        <main className="box-border min-w-0 flex-[999_1_560px] p-8">{children}</main>
      </div>
    </CurrentUserProvider>
  );
}
