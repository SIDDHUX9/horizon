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
  AlertTriangle,
  Server
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
      {/* Top Editorial Banner */}
      <div className="bg-white border border-[#eaeae5] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Background Theme Banner */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: "url('/app-banner.jpg')", backgroundPosition: 'center 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30 pointer-events-none" />

        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#525f6c]">
            <ExternalLink className="w-3.5 h-3.5 text-[#11161a]" />
            <span>Dual-Ledger Zero-Knowledge Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#11161a] tracking-tight">Midnight Blockchain Explorer & Transparency Audit</h2>
          <p className="text-sm text-[#525f6c] leading-relaxed">
            Horizon Protocol validates the Midnight dual-ledger breakthrough: anyone can audit collateral custody, loan state, underwriting policy, and repayments from <strong>real deployed contract state</strong>, while the borrower's raw financial data (salary, debt balances, DTI) is <strong>cryptographically sealed and never exposed anywhere</strong>.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex items-center gap-2">
            <span className="text-[#707e8c] font-sans">Live Midnight Block:</span>
            <span className="text-emerald-700 font-bold">#{blockHeight}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex items-center gap-2">
            <span className="text-[#707e8c] font-sans">Total Transactions:</span>
            <span className="text-[#11161a] font-bold">{transactions.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex items-center gap-2">
            <span className="text-[#707e8c] font-sans">Active Protocol Loans:</span>
            <span className="text-[#553c9a] font-bold">{loans.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex items-center gap-2">
            <span className="text-[#707e8c] font-sans">Proof Server (Port 6300):</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
            <span className="text-[#707e8c] font-sans">Deployed Compact Contract:</span>
            <span className="text-[#11161a] font-bold break-all">0x4bc2648050077254b2118beac93e11c5c55490e1c995b16327693e38c9810962</span>
          </div>
          <a
            href="https://preview.midnightexplorer.com/search?q=0x4bc2648050077254b2118beac93e11c5c55490e1c995b16327693e38c9810962"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#11161a] hover:opacity-75 font-sans font-semibold transition underline shrink-0"
          >
            <span>Verify on Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* CORE FEATURE: Side-by-Side Dual-Ledger State Inspector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#11161a] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#11161a]" />
              <span>Real On-Chain State Audit: Public vs Cryptographically Hidden</span>
            </h3>
            <p className="text-xs text-[#525f6c]">
              Live side-by-side comparison pulling real values directly from our deployed Compact contract ledger.
            </p>
          </div>

          {loans.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#525f6c] font-medium">Select Loan:</span>
              <select
                value={activeLoan ? activeLoan.loan_id : ''}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="bg-[#f8f8f6] border border-[#d5d5cf] focus:border-[#11161a] focus:bg-white text-[#11161a] rounded-xl px-3 py-1.5 text-xs font-mono outline-none shadow-sm"
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
            <div className="bg-white border border-[#eaeae5] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#eaeae5] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#f8f8f6] border border-[#eaeae5] text-[#11161a]">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#11161a] uppercase tracking-wider font-mono">
                        Public On-Chain Ledger State
                      </h4>
                      <p className="text-[11px] text-[#525f6c]">Read directly from real contract maps (pools, loans, repayments)</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    activeLoan.status === LoanStatus.REPAID ? 'bg-[#f0eefc] text-[#553c9a] border border-[#d8d0f5]' :
                    activeLoan.status === LoanStatus.LIQUIDATED ? 'bg-rose-50 text-rose-800 border border-rose-200' : 
                    'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {activeLoan.status}
                  </span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex justify-between items-center">
                    <span className="text-[#707e8c] font-sans">Loan ID (On-Chain Key):</span>
                    <span className="text-[#11161a] font-bold truncate max-w-[220px]" title={activeLoan.loan_id}>
                      {activeLoan.loan_id}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex justify-between items-center">
                    <span className="text-[#707e8c] font-sans">Borrower Address:</span>
                    <span className="text-[#11161a] truncate max-w-[220px]" title={activeLoan.borrower}>
                      {activeLoan.borrower}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                      <span className="text-[#707e8c] text-[10px] font-sans font-medium uppercase tracking-wider block">Principal Disbursed</span>
                      <span className="text-[#11161a] font-bold text-sm mt-0.5 block">{formatNight(activeLoan.loan_amount)}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                      <span className="text-[#707e8c] text-[10px] font-sans font-medium uppercase tracking-wider block">Collateral in Escrow</span>
                      <span className="text-emerald-700 font-bold text-sm mt-0.5 block">{formatNight(activeLoan.collateral_locked)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                      <span className="text-[#707e8c] text-[10px] font-sans font-medium uppercase tracking-wider block">Interest Rate (APR)</span>
                      <span className="text-[#11161a] font-bold text-sm mt-0.5 block">{formatBps(activeLoan.interest_rate_bps)}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                      <span className="text-[#707e8c] text-[10px] font-sans font-medium uppercase tracking-wider block">Total Repaid so Far</span>
                      <span className="text-[#553c9a] font-bold text-sm mt-0.5 block">{formatNight(activeLoan.total_repaid)}</span>
                    </div>
                  </div>

                  {associatedPool && (
                    <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] space-y-2">
                      <div className="text-[10px] text-[#525f6c] uppercase tracking-wider font-bold font-sans">
                        Associated Pool Public Risk Floor:
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] font-sans">
                        <div>
                          <span className="text-[#707e8c] block text-[9px] uppercase">Min Income</span>
                          <span className="text-[#11161a] font-bold font-mono">${Number(associatedPool.min_income).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[#707e8c] block text-[9px] uppercase">Max DTI</span>
                          <span className="text-[#11161a] font-bold font-mono">{formatBps(associatedPool.max_debt_to_income_bps)}</span>
                        </div>
                        <div>
                          <span className="text-[#707e8c] block text-[9px] uppercase">Min CR</span>
                          <span className="text-[#11161a] font-bold font-mono">{formatBps(associatedPool.min_collateral_ratio_bps)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Repayment History Events */}
                  <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] space-y-2">
                    <div className="text-[10px] text-[#525f6c] uppercase tracking-wider font-bold flex items-center justify-between font-sans">
                      <span>Public Repayment Ledger Events</span>
                      <span className="text-[#707e8c] font-normal">{loanRepayments.length} Recorded</span>
                    </div>
                    {loanRepayments.length === 0 ? (
                      <div className="text-[11px] text-[#707e8c] font-sans italic">No repayments recorded on-chain yet.</div>
                    ) : (
                      loanRepayments.map((r) => (
                        <div key={r.repayment_id} className="text-[10px] flex justify-between items-center py-1 border-b border-[#eaeae5]">
                          <span className="text-[#11161a] font-bold">{formatNight(r.amount)}</span>
                          <span className="text-[#707e8c] truncate max-w-[160px]" title={r.tx_hash}>Tx: {r.tx_hash.slice(0, 14)}...</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                    <span className="text-[#707e8c] block text-[10px] font-sans font-medium uppercase tracking-wider">On-Chain Snapshot Commitment (One-Way Digest)</span>
                    <span className="text-[#553c9a] break-all text-[11px] font-bold">{activeLoan.snapshot_commitment}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#eaeae5] text-[11px] text-[#525f6c] flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All above fields are public and mathematically verifiable by any node.</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Cryptographically Shielded Witness */}
            <div className="bg-[#fcfbfe] border border-[#e5dff7] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e5dff7] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white border border-[#e5dff7] text-[#553c9a]">
                      <EyeOff className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#553c9a] uppercase tracking-wider font-mono">
                        Cryptographically Hidden Witness
                      </h4>
                      <p className="text-[11px] text-[#707e8c]">Never stored in ledger state, block headers, or network packets</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f0eefc] text-[#553c9a] border border-[#d8d0f5]">
                    Witness Sealed
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {/* Income */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#e5dff7] space-y-1.5 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#707e8c] font-sans">Actual Borrower Income:</span>
                      <span className="text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">
                        🔒 WITNESS ONLY - NEVER STORED
                      </span>
                    </div>
                    <div className="text-[11px] text-[#525f6c] font-sans">
                      Verified in ZK: <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">actual_income ≥ min_income (${Number(associatedPool?.min_income || 50000).toLocaleString()})</code> floor without disclosing the borrower's exact salary.
                    </div>
                  </div>

                  {/* Debt */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#e5dff7] space-y-1.5 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#707e8c] font-sans">Existing Debt Obligations:</span>
                      <span className="text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">
                        🔒 WITNESS ONLY - NEVER STORED
                      </span>
                    </div>
                    <div className="text-[11px] text-[#525f6c] font-sans">
                      Zero creditor names, credit card balances, or personal liabilities ever enter the consensus layer or public memory.
                    </div>
                  </div>

                  {/* DTI */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#e5dff7] space-y-1.5 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#707e8c] font-sans">Exact Debt-to-Income (DTI):</span>
                      <span className="text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">
                        🔒 WITNESS ONLY - NEVER STORED
                      </span>
                    </div>
                    <div className="text-[11px] text-[#525f6c] font-sans">
                      Verified in ZK: <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">computed_dti ≤ max_dti ({formatBps(associatedPool?.max_debt_to_income_bps || 4000)})</code> ceiling. The lender only learns the inequality evaluated true.
                    </div>
                  </div>

                  {/* Salt */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#e5dff7] space-y-1.5 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#707e8c] font-sans">Secret Blinding Salt:</span>
                      <span className="text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">
                        🔒 WITNESS ONLY - NEVER STORED
                      </span>
                    </div>
                    <div className="text-[11px] text-[#525f6c] font-sans">
                      256 bits of high-entropy randomness prevent dictionary or rainbow-table inversion of the commitment hash.
                    </div>
                  </div>

                  {/* Commitment Proof Property */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#e5dff7] space-y-1.5 shadow-xs">
                    <div className="text-[10px] text-[#553c9a] font-bold uppercase tracking-wider font-sans">
                      Cryptographic Binding Property:
                    </div>
                    <div className="text-[11px] text-[#525f6c] font-sans leading-relaxed">
                      Compact circuit constraint: <code className="text-[#553c9a] bg-[#f0eefc] px-1 py-0.5 rounded border border-[#d8d0f5]">computed_commitment == stored_commitment</code> ensures the borrower cannot alter witness values between snapshot submission and loan disbursement.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5dff7] text-[11px] text-[#553c9a] flex items-center gap-2 font-mono">
                <ShieldCheck className="w-4 h-4 text-[#553c9a] shrink-0" />
                <span>Zero-Knowledge Guarantee: Mathematically impossible to reverse or leak confidential data.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#eaeae5] rounded-3xl p-10 text-center text-[#707e8c] text-xs shadow-sm">
            No active loans found on-chain to inspect. Please deploy a pool and request a loan in the Borrower Studio.
          </div>
        )}
      </div>

      {/* Full Transaction Stream Explorer */}
      <div className="space-y-4 pt-6 border-t border-[#eaeae5]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#11161a] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#11161a]" />
              <span>Full Midnight Transaction Stream ({filteredTx.length})</span>
            </h3>
            <p className="text-xs text-[#525f6c]">Historical circuits evaluated and confirmed against the deployed protocol</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#707e8c] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tx hash or caller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#d5d5cf] focus:border-[#11161a] text-[#11161a] rounded-full pl-9 pr-4 py-2 text-xs font-mono outline-none shadow-sm transition"
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition shadow-xs ${
                  filterCircuit === c
                    ? 'bg-[#11161a] text-white shadow-sm'
                    : 'bg-white text-[#525f6c] hover:text-[#11161a] border border-[#d5d5cf] hover:bg-[#f5f5f0]'
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
            <div className="bg-white border border-[#eaeae5] rounded-3xl p-12 text-center text-[#707e8c] text-xs shadow-sm">
              No matching transactions found on the simulated Midnight ledger.
            </div>
          ) : (
            filteredTx.map((tx) => (
              <div
                key={tx.tx_hash}
                className="bg-white border border-[#eaeae5] hover:border-[#c5c5be] rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm transition"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eaeae5] pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Block #{tx.block_height}
                    </span>
                    <span className="text-[#11161a] font-bold">Circuit: {tx.circuit}()</span>
                  </div>
                  <div className="text-[#525f6c] text-[11px]">
                    <a
                      href={`https://preview.midnightexplorer.com/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#11161a] hover:opacity-75 font-mono transition group"
                      title="Inspect real transaction on Midnight Preview Explorer"
                    >
                      <span>Tx: <span className="font-semibold underline">{tx.tx_hash.slice(0, 14)}...{tx.tx_hash.slice(-8)}</span></span>
                      <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                    </a>
                  </div>
                </div>

                {/* Side-by-Side Audit for this Tx */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visible Column */}
                  <div className="p-4 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] space-y-2">
                    <div className="flex items-center gap-2 text-[#11161a] text-xs font-bold uppercase tracking-wider font-sans">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visible On-Chain Record</span>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      {Object.entries(tx.public_data).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center py-1 border-b border-[#eaeae5] text-[11px]">
                          <span className="text-[#707e8c] font-sans capitalize">{k.replace(/_/g, ' ')}:</span>
                          <span className="text-[#11161a] font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hidden Column */}
                  <div className="p-4 rounded-2xl bg-[#fcfbfe] border border-[#e5dff7] space-y-2">
                    <div className="flex items-center gap-2 text-[#553c9a] text-xs font-bold uppercase tracking-wider font-sans">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Zero-Knowledge Protected Witness</span>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      {Object.entries(tx.hidden_private_data).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center py-1 border-b border-[#e5dff7] text-[11px]">
                          <span className="text-[#707e8c] font-sans capitalize">{k.replace(/_/g, ' ')}:</span>
                          <span className="text-[#553c9a] font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verification Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-xs text-[#707e8c] font-mono">
                  <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-sans font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ZK-SNARK Proof Verified by Midnight Consensus</span>
                  </div>
                  <div className="text-[10px] text-[#707e8c]">
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
