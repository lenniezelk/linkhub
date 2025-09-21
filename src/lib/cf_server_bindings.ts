// Server-only Cloudflare bindings access. This file may import `wrangler` in dev.
let cachedEnv: Env | null = null;
let initPromise: Promise<void> | null = null;

async function loadDevBindings() {
  if (!import.meta.env.DEV) return;
  if (cachedEnv) return;
  if (!initPromise) {
    initPromise = (async () => {
      if (typeof window !== 'undefined') return; // never in browser
      try {
        const { getPlatformProxy } = await import('wrangler');
        const proxy = await getPlatformProxy();
        cachedEnv = proxy.env as unknown as Env;
      } catch (e) {
        console.warn('[cf_server_bindings] Failed to load wrangler dev bindings', e);
      }
    })();
  }
  await initPromise;
}

export async function prepareDevEnv() {
  await loadDevBindings();
}

export function getServerBindings(): Env {
  if (import.meta.env.DEV) {
    if (!cachedEnv) {
      throw new Error('Dev bindings not initialized yet. Call prepareDevEnv() server-side.');
    }
    return cachedEnv;
  }
  return process.env as unknown as Env;
}

if (import.meta.env.DEV && typeof window === 'undefined') {
  void loadDevBindings();
}
