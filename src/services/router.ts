/**
 * Lightweight bidirectional router for Horizon Protocol
 * Synchronizes URL pathnames (/whitepaper, /borrow, /lend, /loans, etc.)
 * with active application view state and HTML5 browser history.
 */

export type ProtocolRoute =
  | 'landing'
  | 'whitepaper'
  | 'borrower'
  | 'lender'
  | 'loans'
  | 'liquidate'
  | 'explorer'
  | 'contract'
  | 'pitch';

export const ROUTE_MAP: Record<ProtocolRoute, string> = {
  landing: '/',
  whitepaper: '/whitepaper',
  borrower: '/borrow',
  lender: '/lend',
  loans: '/loans',
  liquidate: '/liquidate',
  explorer: '/explorer',
  contract: '/contract',
  pitch: '/architecture',
};

export const PATH_TO_ROUTE: Record<string, ProtocolRoute> = {
  '/': 'landing',
  '': 'landing',
  '/landing': 'landing',
  '/home': 'landing',
  '/whitepaper': 'whitepaper',
  '/paper': 'whitepaper',
  '/docs': 'whitepaper',
  '/borrow': 'borrower',
  '/borrower': 'borrower',
  '/lend': 'lender',
  '/lender': 'lender',
  '/loans': 'loans',
  '/loan': 'loans',
  '/liquidate': 'liquidate',
  '/liquidation': 'liquidate',
  '/explorer': 'explorer',
  '/transparency': 'explorer',
  '/contract': 'contract',
  '/contracts': 'contract',
  '/code': 'contract',
  '/zkir': 'contract',
  '/pitch': 'pitch',
  '/architecture': 'pitch',
};

/**
 * Parses current window.location into a normalized ProtocolRoute.
 * Supports both pathnames and hash-based fallbacks (e.g. /#/whitepaper).
 */
export function getCurrentRoute(): ProtocolRoute {
  if (typeof window === 'undefined') return 'landing';

  // Check hash route first if present (e.g., /#/whitepaper)
  const hash = window.location.hash.replace(/^#/, '').toLowerCase().trim();
  if (hash) {
    const cleanHash = hash.startsWith('/') ? hash : `/${hash}`;
    if (PATH_TO_ROUTE[cleanHash]) {
      return PATH_TO_ROUTE[cleanHash];
    }
  }

  // Check standard pathname
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  return PATH_TO_ROUTE[path] || 'landing';
}

/**
 * Navigates to a specific protocol route, pushing to browser history
 * and updating the window address bar.
 */
export function navigateToRoute(route: ProtocolRoute, replace = false): void {
  if (typeof window === 'undefined') return;

  const targetPath = ROUTE_MAP[route] || '/';
  const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';

  if (currentPath !== targetPath) {
    if (replace) {
      window.history.replaceState({ route }, '', targetPath);
    } else {
      window.history.pushState({ route }, '', targetPath);
    }
  }

  // Dispatch synthetic event for listeners
  window.dispatchEvent(new CustomEvent('protocol-route-change', { detail: { route, path: targetPath } }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
