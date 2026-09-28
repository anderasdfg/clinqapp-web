// ponytail: self-check for access-token cache (no vite)
// run: node frontend/scripts/check-access-token.mjs

let accessToken = null;
function setAccessToken(token) {
  accessToken = token;
}
async function resolveAccessToken(getSession, timeoutMs = 50) {
  if (accessToken) return accessToken;
  const fromSession = await Promise.race([
    getSession(),
    new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
  if (fromSession) accessToken = fromSession;
  return fromSession;
}

(async () => {
  setAccessToken('cached');
  if ((await resolveAccessToken(async () => 'fresh')) !== 'cached') {
    throw new Error('cache miss');
  }
  setAccessToken(null);
  if ((await resolveAccessToken(async () => 'fresh')) !== 'fresh') {
    throw new Error('fallback fail');
  }
  setAccessToken(null);
  // hung getSession → timeout → null
  const hung = await resolveAccessToken(
    () => new Promise(() => {}),
    30,
  );
  if (hung !== null) throw new Error('timeout fail');
  console.log('ok access-token');
})();
