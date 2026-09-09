import React, { useState } from 'react';
import { 
  Clock, 
  Coins, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  ArrowRight,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Loan, LoanStatus, RepaymentEvent } from '../types/horizon';
import { formatNight, formatBps } from '../contracts/horizonSimulator';

interface LoanDetailTerminalProps {
  loans: Loan[];
  repayments: RepaymentEvent[];
  onRepayLoan: (loanId: string, amount: bigint) => Promise<boolean>;
  userNightBalance: bigint;
  currentTime: bigint;
}

export const LoanDetailTerminal: React.FC<LoanDetailTerminalProps> = ({
  loans,
  repayments,
  onRepayLoan,
  userNightBalance,
  currentTime,
}) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLoan = loans.find((l) => l.loan_id === selectedLoanId);

  const calculateTotalDue = (loan: Loan): bigint => {
    const interest = (loan.loan_amount * BigInt(loan.interest_rate_bps)) / 10000n;
    return loan.loan_amount + interest;
  };

  const handleOpenRepay = (loan: Loan) => {
    setSelectedLoanId(loan.loan_id);
    const totalDue = calculateTotalDue(loan);
    const remaining = totalDue > loan.total_repaid ? totalDue - loan.total_repaid : 0n;
    setRepayAmount(remaining.toString());
    setError(null);
  };

  const handleSubmitRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return;
    setError(null);
    setLoading(true);
    try {
      const amt = BigInt(repayAmount);
      if (amt <= 0n) throw new Error('Repayment amount must be positive');
      if (amt > userNightBalance) throw new Error('Insufficient wallet NIGHT balance');

      const isFullyRepaid = await onRepayLoan(selectedLoanId, amt);
      if (isFullyRepaid) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
      setSelectedLoanId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit repayment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4" />
            <span>Debt Service & Custody</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Active Loan Management</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Monitor active loans, interest accruals, and deadlines. Each repayment transaction updates the on-chain ledger without disclosing borrower identity or income source.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-right">
          <div className="text-slate-400">Total Protocol Loans:</div>
          <div className="text-xl font-bold text-white">{loans.length} Loans</div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Coins className="w-4 h-4 text-cyan-400" />
          <span>Protocol Loan Ledger</span>
        </h3>

        {loans.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-base font-semibold text-slate-300">No active loans found on-chain</p>
            <p className="text-xs text-slate-500">Go to Borrower ZK Studio to request your first private loan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {loans.map((loan) => {
              const totalDue = calculateTotalDue(loan);
              const remainingOwed = totalDue > loan.total_repaid ? totalDue - loan.total_repaid : 0n;
              const isExpired = currentTime > loan.due_date && loan.status === LoanStatus.ACTIVE;
              const dueDateObj = new Date(Number(loan.due_date) * 1000);

              let badgeClass = 'badge-active';
              if (loan.status === LoanStatus.REPAID) badgeClass = 'badge-repaid';
              if (loan.status === LoanStatus.LIQUIDATED) badgeClass = 'badge-liquidated';

              return (
                <div
                  key={loan.loan_id}
                  className="glass-panel p-6 space-y-4 hover:border-slate-700 transition relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`badge ${badgeClass} text-[10px]`}>{loan.status}</span>
                      <span className="text-xs font-mono text-cyan-400 font-semibold">
                        Loan ID: {loan.loan_id.slice(0, 16)}...
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      Borrower: {loan.borrower.slice(0, 12)}...
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Principal Disbursed</div>
                      <div className="text-base font-bold text-white mt-0.5">{formatNight(loan.loan_amount)}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{formatBps(loan.interest_rate_bps)} Fixed APR</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Collateral Locked</div>
                      <div className="text-base font-bold text-emerald-300 mt-0.5">
                        {formatNight(loan.collateral_locked)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        {loan.status === LoanStatus.REPAID ? (
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Released
                          </span>
                        ) : loan.status === LoanStatus.LIQUIDATED ? (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Seized
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> In Escrow
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Total Due / Repaid</div>
                      <div className="text-base font-bold text-cyan-300 mt-0.5">
                        {formatNight(loan.total_repaid)} / {formatNight(totalDue)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Remaining: {formatNight(remainingOwed)}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-500">Due Date Deadline</div>
                      <div className={`text-sm font-bold mt-0.5 ${isExpired ? 'text-rose-400' : 'text-slate-200'}`}>
                        {dueDateObj.toLocaleDateString()}
                      </div>
                      <div className="text-[10px] mt-1">
                        {isExpired ? (
                          <span className="text-rose-400 font-bold">⚠️ PAST DUE</span>
                        ) : loan.status === LoanStatus.REPAID ? (
                          <span className="text-cyan-400">Settled on-time</span>
                        ) : (
                          <span className="text-slate-400">Active grace period</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {loan.status === LoanStatus.ACTIVE && (
                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-xs text-slate-400 font-mono">
                        Snapshot Commitment: {loan.snapshot_commitment.slice(0, 16)}...
                      </div>
                      <button
                        onClick={() => handleOpenRepay(loan)}
                        className="btn-primary text-xs !py-2 !px-4"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Make Repayment</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Repay Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel p-6 sm:p-8 max-w-md w-full space-y-6 border-cyan-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Loan Repayment</h3>
                  <p className="text-xs text-slate-400 font-mono">repayLoan() Circuit</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoanId(null)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmitRepay} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Loan Principal:</span>
                  <span className="text-white">{formatNight(selectedLoan.loan_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Interest Rate:</span>
                  <span className="text-cyan-300">{formatBps(selectedLoan.interest_rate_bps)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Due (Principal + Interest):</span>
                  <span className="text-white font-bold">{formatNight(calculateTotalDue(selectedLoan))}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Already Repaid:</span>
                  <span className="text-emerald-300">{formatNight(selectedLoan.total_repaid)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Repayment Amount (NIGHT)
                </label>
                <input
                  type="number"
                  min="1"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="input-field font-mono"
                  placeholder="e.g. 20000"
                  required
                />
                <span className="text-[11px] text-slate-400">Wallet Balance: {formatNight(userNightBalance)}</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Collateral Release Rule:</span>
                </div>
                <p className="text-[11px] text-emerald-200/80">
                  Once total debt is paid in full, the contract automatically marks the loan as <code>REPAID</code> and releases all locked collateral back to your wallet.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoanId(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs"
                >
                  {loading ? 'Submitting Repayment...' : 'Confirm Repayment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
