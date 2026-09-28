/**
 * In-memory access token for API calls.
 * Avoid awaiting supabase.auth.getSession() inside axios interceptors —
 * it can deadlock with onAuthStateChange / navigator locks and leave
 * UI stuck on skeletons with zero network requests.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/** Prefer cache; fall back to getSession with a hard timeout. */
export async function resolveAccessToken(
  getSession: () => Promise<string | null>,
  timeoutMs = 2500,
): Promise<string | null> {
  if (accessToken) return accessToken;

  const fromSession = await Promise.race([
    getSession(),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);

  if (fromSession) accessToken = fromSession;
  return fromSession;
}
