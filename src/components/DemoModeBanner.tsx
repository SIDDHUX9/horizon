import React from 'react';
import { getRuntimeMode, setDemoMode } from '../services/runtimeMode';

/**
 * Honesty banner. In production mode the protocol is explicitly offline until
 * a verified deployment exists; demo mode is opt-in via ?demo=1 or the toggle.
 */
export const DemoModeBanner: React.FC = () => {
  const mode = getRuntimeMode();
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  const isDemo = mode === 'demo';
  return (
    <div
      className={`sticky top-0 z-50 w-full border-b px-4 py-2 text-center text-[11px] font-semibold backdrop-blur ${
        isDemo
          ? 'border-amber-300 bg-amber-100/95 text-amber-950'
          : 'border-rose-300 bg-rose-100/95 text-rose-950'
      }`}
    >
      <span className="font-extrabold uppercase tracking-wider">
        {isDemo ? 'Demo Mode' : 'Protocol Not Live'}
      </span>
      <span className="mx-2 opacity-60">•</span>
      <span className="font-medium">
        {isDemo
          ? 'Protocol state and proof progress are simulated in this browser. No on-chain transactions are submitted.'
          : 'No verified deployment exists. Circuit calls are disabled.'}
      </span>
      <button
        type="button"
        className="ml-3 underline underline-offset-2 hover:opacity-70"
        onClick={() => {
          setDemoMode(!isDemo);
          const url = new URL(window.location.href);
          if (isDemo) url.searchParams.delete('demo');
          else url.searchParams.set('demo', '1');
          window.location.href = url.toString();
        }}
      >
        {isDemo ? 'Exit demo' : 'Enter demo'}
      </button>
      <button
        type="button"
        aria-label="Dismiss banner"
        className="ml-3 opacity-60 hover:opacity-100"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  );
};
