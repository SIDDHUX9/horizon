import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { getDeploymentRecord } from '../services/deploymentGate';

interface ProtocolOfflinePanelProps {
  circuit?: string;
}

/** Replaces simulator-backed forms in production until a deployment is verified. */
export const ProtocolOfflinePanel: React.FC<ProtocolOfflinePanelProps> = ({ circuit }) => {
  const record = getDeploymentRecord();

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-rose-700">
              Production mode
            </div>
            <h2 className="mt-1 text-2xl font-serif text-[#11161a]">Circuit calls are disabled</h2>
          </div>
          <p className="text-sm leading-relaxed text-[#525f6c]">
            No independently verified Horizon contract deployment exists on {record.network}. The
            browser client will not submit a transaction or fall back to simulator state.
          </p>
          {circuit && (
            <p className="rounded-xl border border-[#eaeae5] bg-[#f8f8f6] p-3 font-mono text-xs text-[#11161a]">
              Blocked circuit: <strong>{circuit}()</strong>
            </p>
          )}
          <p className="text-xs leading-relaxed text-[#707e8c]">
            To inspect the explicitly labelled local demonstration, add{' '}
            <code className="rounded bg-[#f5f5f0] px-1.5 py-0.5">?demo=1</code> to the URL. To
            enable production circuit calls, deploy the contract, verify its address and transaction on the live
            indexer with <code className="rounded bg-[#f5f5f0] px-1.5 py-0.5">npm run verify:deployment</code>,
            and update the canonical deployment record.
          </p>
        </div>
      </div>
    </div>
  );
};
