/**
 * Runtime mode selection. Demo mode is an explicit opt-in for development only.
 * Production builds always stay in production mode, even if a demo flag or a
 * stale localStorage value is present.
 */
export type RuntimeMode = 'demo' | 'production';

const DEMO_STORAGE_KEY = 'horizon:demo-mode';

export function isDemoAllowed(): boolean {
  return import.meta.env.DEV;
}

function hasExplicitDemoFlag(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === '1' || params.get('demo') === 'true') return true;
  try {
    return window.localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function getRuntimeMode(): RuntimeMode {
  if (!isDemoAllowed()) return 'production';
  if (import.meta.env.VITE_DEMO_MODE === 'true') return 'demo';
  return hasExplicitDemoFlag() ? 'demo' : 'production';
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window === 'undefined' || !isDemoAllowed()) return;
  try {
    if (enabled) window.localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    else window.localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // Storage unavailable; the URL flag remains the fallback.
  }
}

export class ProductionModeError extends Error {
  constructor(action: string) {
    const demoHint = isDemoAllowed()
      ? ' Add ?demo=1 to the URL to use the explicitly labelled local demonstration.'
      : '';
    super(`${action} is disabled: the protocol is not deployed and verified.${demoHint}`);
    this.name = 'ProductionModeError';
  }
}

/** Throws in production mode. Call at the top of every simulator-backed handler. */
export function assertDemoMode(action: string, mode: RuntimeMode): void {
  if (mode !== 'demo') throw new ProductionModeError(action);
}
