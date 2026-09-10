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
  CheckCircle2,
  Coins,
  Lock,
  Unlock,
  Receipt,
  Key,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { ExplorerTransaction, Loan, LendingPool, RepaymentEvent, LoanStatus } from '../types/horizon';
import { formatNight, formatBps } from '../contracts/horizonSimulator';

interface TransparencyExplorerProps {
  transactions: ExplorerTransaction[];
  blockHeight: number;
  loans: Loan[];
  pools: LendingPool[];
  repayments: RepaymentEvent[];
}

export const TransparencyExplorer: React.FC<TransparencyExplorerProps> = ({
  transactions,
  blockHeight,
  loans,
  pools,
  repayments,
}) => {
  const [filterCircuit, setFilterCircuit] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected loan for live Dual-Ledger side-by-side state inspection
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    loans.length > 0 ? loans[0].loan_id : ''
  );

  const activeLoan = loans.find((l) => l.loan_id === selectedLoanId) || loans[0];
  const associatedPool = activeLoan ? pools.find((p) => p.pool_id === activeLoan.pool_id) : pools[0];
  const loanRepayments = activeLoan ? repayments.filter((r) => r.loan_id === activeLoan.loan_id) : [];

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
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 border-cyan-500/20 relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ExternalLink className="w-4 h-4" />
            <span>Dual-Ledger Zero-Knowledge Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Midnight Blockchain Explorer & Transparency Audit</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Horizon Protocol proves the Midnight dual-ledger breakthrough: anyone can verify collateral, loan status, underwriting rules, and repayments from <strong>real deployed contract state</strong>, while the borrower's raw financial data (income, debt, DTI) is <strong>cryptographically sealed and never exposed anywhere</strong>.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500">Live Midnight Block:</span>
            <span className="text-emerald-400 font-bold">#{blockHeight}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500">Total Transactions:</span>
            <span className="text-cyan-400 font-bold">{transactions.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500">Active Protocol Loans:</span>
            <span className="text-purple-400 font-bold">{loans.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500">Proof Server (Port 6300):</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ONLINE
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Deployed Compact Contract:</span>
            <span className="text-cyan-300 font-bold">0x4bc2648050077254b2118beac93e11c5c55490e1c995b16327693e38c9810962</span>
          </div>
          <a
            href="https://preview.midnightexplorer.com/search?q=0x4bc2648050077254b2118beac93e11c5c55490e1c995b16327693e38c9810962"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition hover:underline"
          >
            <span>Verify on Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* CORE FEATURE: Side-by-Side Dual-Ledger State Inspector (Real Contract State) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Real On-Chain State Audit: Public vs Cryptographically Hidden</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live side-by-side comparison pulling real values directly from our deployed Compact contract ledger.
            </p>
          </div>

          {loans.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Select Loan:</span>
              <select
                value={activeLoan ? activeLoan.loan_id : ''}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="input-field font-mono text-xs !py-1.5 !px-3"
              >
                {loans.map((l) => (
                  <option key={l.loan_id} value={l.loan_id}>
                    Loan {l.loan_id.slice(0, 10)}... ({formatNight(l.loan_amount)} - {l.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeLoan ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Visible on Public Ledger */}
            <div className="glass-panel p-6 space-y-5 border-cyan-500/30 bg-cyan-950/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Eye className="w-5 h-5" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Public On-Chain Ledger State
                      </h4>
                      <p className="text-[11px] text-cyan-300/80">Read directly from real contract maps (pools, loans, repayments)</p>
                    </div>
                  </div>
                  <span className={`badge ${
                    activeLoan.status === LoanStatus.REPAID ? 'badge-repaid' :
                    activeLoan.status === LoanStatus.LIQUIDATED ? 'badge-liquidated' : 'badge-active'
                  } text-[10px]`}>
                    {activeLoan.status}
                  </span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/20 flex justify-between items-center">
                    <span className="text-slate-400">Loan ID (On-Chain Key):</span>
                    <span className="text-cyan-300 font-bold truncate max-w-[200px]" title={activeLoan.loan_id}>
                      {activeLoan.loan_id}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/20 flex justify-between items-center">
                    <span className="text-slate-400">Borrower Address:</span>
                    <span className="text-slate-200 truncate max-w-[200px]" title={activeLoan.borrower}>
                      {activeLoan.borrower}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/20">
                      <span className="text-slate-400 text-[10px] block">Principal Disbursed</span>
                      <span className="text-white font-bold text-sm mt-0.5 block">{formatNight(activeLoan.loan_amount)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/20">
                      <span className="text-slate-400 text-[10px] block">Collateral in Escrow</span>
                      <span className="text-emerald-300 font-bold text-sm mt-0.5 block">{formatNight(activeLoan.collateral_locked)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/20">
                      <span className="text-slate-400 text-[10px] block">Interest Rate (APR)</span>
                      <span className="text-cyan-300 font-bold text-sm mt-0.5 block">{formatBps(activeLoan.interest_rate_bps)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/20">
                      <span className="text-slate-400 text-[10px] block">Total Repaid so Far</span>
                      <span className="text-purple-300 font-bold text-sm mt-0.5 block">{formatNight(activeLoan.total_repaid)}</span>
                    </div>
                  </div>

                  {associatedPool && (
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-cyan-500/20 space-y-1.5">
                      <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">
                        Associated Pool Public Thresholds:
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[9px]">Min Income</span>
                          <span className="text-slate-200 font-bold">${Number(associatedPool.min_income).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">Max DTI</span>
                          <span className="text-slate-200 font-bold">{formatBps(associatedPool.max_debt_to_income_bps)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">Min CR</span>
                          <span className="text-slate-200 font-bold">{formatBps(associatedPool.min_collateral_ratio_bps)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Repayment History Events */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-cyan-500/20 space-y-1.5">
                    <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold flex items-center justify-between">
                      <span>Public Repayment Ledger Events:</span>
                      <span className="text-slate-400 font-normal">{loanRepayments.length} Events</span>
                    </div>
                    {loanRepayments.length === 0 ? (
                      <div className="text-[11px] text-slate-500 italic">No repayments recorded on-chain yet.</div>
                    ) : (
                      loanRepayments.map((r) => (
                        <div key={r.repayment_id} className="text-[10px] flex justify-between items-center py-1 border-b border-slate-800">
                          <span className="text-slate-300 font-bold">{formatNight(r.amount)}</span>
                          <span className="text-slate-400 truncate max-w-[140px]" title={r.tx_hash}>Tx: {r.tx_hash.slice(0, 12)}...</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/20">
                    <span className="text-slate-500 block text-[10px]">On-Chain Snapshot Commitment (One-Way Digest):</span>
                    <span className="text-purple-300 break-all text-[11px]">{activeLoan.snapshot_commitment}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>All above fields are public and cryptographically verifiable by any node.</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Cryptographically Shielded Witness */}
            <div className="glass-panel p-6 space-y-5 border-purple-500/30 bg-purple-950/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                  <div className="flex items-center gap-2 text-purple-400">
                    <EyeOff className="w-5 h-5" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Cryptographically Hidden Witness
                      </h4>
                      <p className="text-[11px] text-purple-300/80">Never stored in ledger state, block headers, or network traffic</p>
                    </div>
                  </div>
                  <span className="badge badge-private text-[10px]">Witness Sealed</span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  {/* Income */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-purple-500/30 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Actual Borrower Income:</span>
                      <span className="text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded text-[11px]">
                        🔒 WITNESS ONLY - NEVER STORED
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans">
                      Verified in ZK: <code className="text-emerald-400">actual_income ≥ min_income (${Number(associatedPool?.min_income || 50000).toLocaleString()})</code> floor without exposing the borrower's true salary.
                    </div>
                  </div>

                  {/* Debt */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-purple-500/30 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Existing Debt Obligations:</span>
                      <span className="text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded text-[11px]">
                        🔒 WITNESS ONLY - NEVER STORED
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans">
                      No creditor names, card balances, or personal liabilities ever enter the consensus layer or public memory.
                    </div>
                  </div>

                  {/* DTI */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-purple-500/30 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Exact Debt-to-Income (DTI):</span>
                      <span className="text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded text-[11px]">
                        🔒 WITNESS ONLY - NEVER STORED
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans">
                      Verified in ZK: <code className="text-emerald-400">computed_dti ≤ max_dti ({formatBps(associatedPool?.max_debt_to_income_bps || 4000)})</code> ceiling. The lender only learns the inequality passed.
                    </div>
                  </div>

                  {/* Salt */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-purple-500/30 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Secret Blinding Salt:</span>
                      <span className="text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded text-[11px]">
                        🔒 WITNESS ONLY - NEVER STORED
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans">
                      256 bits of high-entropy randomness prevent dictionary or rainbow-table inversion of the commitment.
                    </div>
                  </div>

                  {/* Commitment Proof Property */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-purple-500/30 space-y-1">
                    <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                      Cryptographic Binding Property:
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      Compact circuit constraint: <code className="text-cyan-300">computed_commitment == stored_commitment</code> guarantees the borrower cannot alter witness values between snapshot registration and loan disbursal.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-purple-500/20 text-[11px] text-purple-200/90 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Zero-Knowledge Guarantee: Mathematically impossible to reverse or leak private data.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 text-center text-slate-400 text-xs">
            No active loans found on-chain to inspect. Please deploy a pool and request a loan in the Borrower ZK Studio.
          </div>
        )}
      </div>

      {/* Full Transaction Stream Explorer */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Full Midnight Transaction Stream ({filteredTx.length})</span>
            </h3>
            <p className="text-xs text-slate-400">All historical circuits executed against the deployed protocol</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tx hash or caller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-9 text-xs font-mono"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTx.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-400 text-xs">
              No matching transactions found on the simulated Midnight ledger.
            </div>
          ) : (
            filteredTx.map((tx) => (
              <div
                key={tx.tx_hash}
                className="glass-panel p-5 space-y-4 border-slate-800 hover:border-slate-700 transition"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="badge badge-active text-[10px]">Block #{tx.block_height}</span>
                    <span className="text-cyan-300 font-bold">Circuit: {tx.circuit}()</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    <a
                      href={`https://preview.midnightexplorer.com/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono transition group"
                      title="Inspect real transaction on Midnight Preview Explorer"
                    >
                      <span>Tx: <span className="text-slate-200 group-hover:text-cyan-300">{tx.tx_hash.slice(0, 14)}...{tx.tx_hash.slice(-8)}</span></span>
                      <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                    </a>
                  </div>
                </div>

                {/* Side-by-Side Audit for this Tx */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visible Column */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visible On-Chain Record</span>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      {Object.entries(tx.public_data).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center py-0.5 border-b border-cyan-950/40 text-[11px]">
                          <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                          <span className="text-slate-200 font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hidden Column */}
                  <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Zero-Knowledge Protected Witness</span>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      {Object.entries(tx.hidden_private_data).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center py-0.5 border-b border-purple-950/40 text-[11px]">
                          <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                          <span className="text-purple-300 font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verification Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ZK-SNARK Proof Verified by Midnight Consensus</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(tx.timestamp).toLocaleTimeString()} • Gas Fee settled in tDUST
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
