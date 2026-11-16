'use client';

import { createContext, useContext } from 'react';
import type { CurrentUser } from '@/lib/types';

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUser | null;
  children: React.ReactNode;
}) {
  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>;
}

/** The signed-in user, as resolved by the dashboard layout. */
export function useCurrentUser() {
  const user = useContext(CurrentUserContext);
  return { user, isAdmin: user?.role === 'ADMIN' };
}
