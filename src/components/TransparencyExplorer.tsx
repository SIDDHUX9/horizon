import React, { useState } from 'react';
import { 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Clock, 
  Layers, 
  FileCode2,
  CheckCircle2
} from 'lucide-react';
import { ExplorerTransaction } from '../types/horizon';

interface TransparencyExplorerProps {
  transactions: ExplorerTransaction[];
  blockHeight: number;
}

export const TransparencyExplorer: React.FC<TransparencyExplorerProps> = ({
  transactions,
  blockHeight,
}) => {
  const [filterCircuit, setFilterCircuit] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTx = transactions.filter((tx) => {
    const matchesCircuit = filterCircuit === 'ALL' || tx.circuit === filterCircuit;
    const matchesSearch =
      tx.tx_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.circuit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.caller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCircuit && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 border-cyan-500/20 relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ExternalLink className="w-4 h-4" />
            <span>Public Ledger Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Midnight Blockchain Explorer</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            This transparency explorer demonstrates the core privacy thesis: anyone can verify that transactions executed and proofs passed, but <strong>nowhere in any block header or ledger state</strong> are the borrower’s actual financial numbers visible.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500">Current Block:</span>
            <span className="text-emerald-400 font-bold">#{blockHeight}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500">Total Indexed Transactions:</span>
            <span className="text-cyan-400 font-bold">{transactions.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500">Consensus:</span>
            <span className="text-purple-400 font-bold">Midnight PoS + ZK Proofs</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {['ALL', 'createLendingPool', 'submitFinancialSnapshot', 'requestLoan', 'repayLoan', 'liquidate'].map(
            (c) => (
              <button
                key={c}
                onClick={() => setFilterCircuit(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  filterCircuit === c
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {c === 'ALL' ? 'All Circuits' : `${c}()`}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tx hash or caller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-9 text-xs"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {filteredTx.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400 text-xs">
            No matching transactions found on the simulated Midnight ledger.
          </div>
        ) : (
          filteredTx.map((tx) => (
            <div
              key={tx.tx_hash}
              className="glass-panel p-6 space-y-6 border-slate-800 hover:border-slate-700 transition"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="badge badge-active text-[10px]">Block #{tx.block_height}</span>
                  <span className="text-cyan-300 font-bold">Circuit: {tx.circuit}()</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Tx: <span className="text-slate-200">{tx.tx_hash.slice(0, 16)}...{tx.tx_hash.slice(-8)}</span>
                </div>
              </div>

              {/* Side-by-Side Audit: Visible vs Hidden */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visible Column */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <Eye className="w-4 h-4" />
                    <span>Visible On-Chain Data</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    {Object.entries(tx.public_data).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center py-1 border-b border-cyan-950/40">
                        <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                        <span className="text-slate-200 font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hidden Column */}
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <EyeOff className="w-4 h-4" />
                    <span>Cryptographically Hidden Witness Data</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    {Object.entries(tx.hidden_private_data).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center py-1 border-b border-purple-950/40">
                        <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                        <span className="text-purple-300 font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Proof Verification Stamp */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ZK-SNARK Proof Verified by Midnight Consensus Engine</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {new Date(tx.timestamp).toLocaleTimeString()} • Gas Fee paid in DUST
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
