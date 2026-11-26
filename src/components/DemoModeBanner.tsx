import React from 'react';

/**
 * Global honesty banner shown until the browser can call a verified contract.
 * The wallet connector is real, but protocol state and proof progress are local.
 */
export const DemoModeBanner: React.FC = () => (
  <div className="sticky top-0 z-50 w-full border-b border-amber-300 bg-amber-100/95 px-4 py-2 text-center text-[11px] font-semibold text-amber-950 backdrop-blur">
    <span className="font-extrabold uppercase tracking-wider">Demo Mode</span>
    <span className="mx-2 opacity-60">•</span>
    <span className="font-medium">
      Protocol state and proof progress are simulated in this browser. No on-chain transactions are submitted.
    </span>
  </div>
);
