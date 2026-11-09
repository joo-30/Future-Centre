import type { UserPublic } from '@future/shared';
import type { QueryClient } from '@tanstack/react-query';

/** Replace session state without retaining data from the previous account. */
export async function replaceSession(
  client: QueryClient,
  user: UserPublic | null,
  preserveQueries: readonly string[] = [],
) {
  const sharedQueries = new Set(['auth', 'catalog', ...preserveQueries]);
  await client.cancelQueries();
  client.removeQueries({
    predicate: (query) => !sharedQueries.has(String(query.queryKey[0])),
  });
  client.setQueryData(['auth'], { user });
  if (user?.role === 'admin') {
    client.setQueryData(['auth', 'admin'], { user });
  } else if (user?.role === 'patient') {
    client.setQueryData(['auth', 'patient'], { user });
  } else if (!user) {
    client.setQueryData(['auth', 'admin'], { user: null });
    client.setQueryData(['auth', 'patient'], { user: null });
  }
}
