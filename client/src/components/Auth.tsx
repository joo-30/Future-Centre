import type { UserPublic } from '@future/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../lib/portal-api';
import { replaceSession } from '../lib/session-cache';
import { ErrorState, Loading } from './ui';
const AuthContext = createContext<{
  user: UserPublic | null;
  adminUser: UserPublic | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<unknown>;
  logout: (context?: 'admin' | 'patient') => Promise<void>;
}>({
  user: null,
  adminUser: null,
  loading: true,
  error: null,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const location = useLocation();

  const patientQuery = useQuery({
    queryKey: ['auth', 'patient'],
    queryFn: () => authApi.me('patient'),
    retry: 1,
    staleTime: 60000,
  });

  const adminQuery = useQuery({
    queryKey: ['auth', 'admin'],
    queryFn: () => authApi.me('admin'),
    retry: 1,
    staleTime: 60000,
  });

  const logout = async (context?: 'admin' | 'patient') => {
    const target = context || (location.pathname.startsWith('/admin') ? 'admin' : 'patient');
    try {
      await authApi.logout(target);
    } catch {
      // ignore
    }
    await replaceSession(client, null);
    if (target === 'admin') {
      client.setQueryData(['auth', 'admin'], { user: null });
      void client.invalidateQueries({ queryKey: ['auth', 'admin'] });
    } else {
      client.setQueryData(['auth', 'patient'], { user: null });
      void client.invalidateQueries({ queryKey: ['auth', 'patient'] });
    }
    void client.invalidateQueries({ queryKey: ['auth'] });
  };

  const isAdminRoute = location.pathname.startsWith('/admin');
  const patientUser = patientQuery.data?.user || null;
  const adminUser = adminQuery.data?.user || null;

  const activeUser = isAdminRoute ? adminUser : patientUser;
  const activeLoading = isAdminRoute
    ? adminQuery.isPending
    : patientQuery.isPending;
  const activeError = (isAdminRoute ? adminQuery.error : patientQuery.error) as Error | null;

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        adminUser,
        loading: activeLoading,
        error: activeError,
        refresh: async () => {
          await Promise.all([patientQuery.refetch(), adminQuery.refetch()]);
        },
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
export function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading) return <Loading />;
  if (auth.error)
    return <ErrorState message={auth.error.message} onRetry={() => void auth.refresh()} />;
  if (!auth.user)
    return (
      <Navigate
        to={'/login?next=' + encodeURIComponent(location.pathname + location.search)}
        replace
      />
    );
  if (admin && auth.user.role !== 'admin') return <Navigate to="/account" replace />;
  return <>{children}</>;
}
