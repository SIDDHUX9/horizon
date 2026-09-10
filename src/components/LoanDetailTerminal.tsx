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
  Receipt,
  X,
  Sparkles
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
      {/* Editorial Banner */}
      <div className="bg-white border border-[#eaeae5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background Theme Banner */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: "url('/app-banner.jpg')", backgroundPosition: 'center 45%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30 pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#525f6c]">
            <Clock className="w-3.5 h-3.5 text-[#11161a]" />
            <span>Debt Service & Custody</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#11161a] tracking-tight">Active Loan Management</h2>
          <p className="text-sm text-[#525f6c] leading-relaxed">
            Monitor active debt, interest accrual, and repayment schedules. Each repayment updates the on-chain ledger in zero-knowledge without revealing borrower identity or employer telemetry.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#eaeae5] font-mono text-xs text-left sm:text-right shrink-0 relative z-10 shadow-xs">
          <div className="text-[#707e8c] text-[11px]">Total Protocol Loans</div>
          <div className="text-2xl font-black text-[#11161a] mt-0.5">{loans.length} Positions</div>
        </div>
      </div>

      {/* Loans Ledger Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#11161a] flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#11161a]" />
            <span>Protocol Loan Ledger</span>
          </h3>
          <span className="text-xs font-mono text-[#707e8c]">{loans.length} loans on record</span>
        </div>

        {loans.length === 0 ? (
          <div className="bg-white border border-[#eaeae5] rounded-3xl p-12 text-center text-[#707e8c] space-y-3 shadow-sm">
            <Clock className="w-10 h-10 mx-auto text-[#b8b8b0]" />
            <p className="text-base font-semibold text-[#11161a]">No active loans found on-chain</p>
            <p className="text-xs text-[#525f6c] max-w-sm mx-auto">
              Head over to the Borrower Studio to evaluate loan terms and submit your confidential zero-knowledge financial snapshot.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {loans.map((loan) => {
              const totalDue = calculateTotalDue(loan);
              const remainingOwed = totalDue > loan.total_repaid ? totalDue - loan.total_repaid : 0n;
              const isExpired = currentTime > loan.due_date && loan.status === LoanStatus.ACTIVE;
              const dueDateObj = new Date(Number(loan.due_date) * 1000);

              let statusBadge = (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE
                </span>
              );

              if (loan.status === LoanStatus.REPAID) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f0eefc] text-[#553c9a] border border-[#d8d0f5]">
                    <CheckCircle2 className="w-3 h-3 text-[#553c9a]" />
                    REPAID
                  </span>
                );
              } else if (loan.status === LoanStatus.LIQUIDATED) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    LIQUIDATED
                  </span>
                );
              }

              return (
                <div
                  key={loan.loan_id}
                  className="bg-white border border-[#eaeae5] hover:border-[#c5c5be] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaeae5] pb-4">
                    <div className="flex items-center gap-3">
                      {statusBadge}
                      <span className="text-xs font-mono text-[#11161a] font-bold">
                        Loan ID: {loan.loan_id.slice(0, 16)}...
                      </span>
                    </div>

                    <div className="text-xs font-mono text-[#707e8c]">
                      Borrower: <span className="text-[#11161a] font-semibold">{loan.borrower.slice(0, 14)}...</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                      <div className="text-[10px] text-[#707e8c] font-sans font-medium uppercase tracking-wider">Principal Disbursed</div>
                      <div className="text-base font-bold text-[#11161a] mt-1">{formatNight(loan.loan_amount)}</div>
                      <div className="text-[11px] text-[#525f6c] mt-1 font-sans">{formatBps(loan.interest_rate_bps)} Fixed APR</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                      <div className="text-[10px] text-[#707e8c] font-sans font-medium uppercase tracking-wider">Collateral Locked</div>
                      <div className="text-base font-bold text-emerald-700 mt-1">
                        {formatNight(loan.collateral_locked)}
                      </div>
                      <div className="text-[11px] mt-1 font-sans flex items-center gap-1">
                        {loan.status === LoanStatus.REPAID ? (
                          <span className="text-[#553c9a] flex items-center gap-1 font-semibold">
                            <Unlock className="w-3 h-3" /> Released
                          </span>
                        ) : loan.status === LoanStatus.LIQUIDATED ? (
                          <span className="text-rose-700 flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Seized
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                            <Lock className="w-3 h-3" /> In Escrow
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                      <div className="text-[10px] text-[#707e8c] font-sans font-medium uppercase tracking-wider">Total Due / Repaid</div>
                      <div className="text-base font-bold text-[#11161a] mt-1">
                        {formatNight(loan.total_repaid)} / {formatNight(totalDue)}
                      </div>
                      <div className="text-[11px] text-[#525f6c] mt-1 font-sans">Remaining: {formatNight(remainingOwed)}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                      <div className="text-[10px] text-[#707e8c] font-sans font-medium uppercase tracking-wider">Due Date Deadline</div>
                      <div className={`text-sm font-bold mt-1 ${isExpired ? 'text-rose-600' : 'text-[#11161a]'}`}>
                        {dueDateObj.toLocaleDateString()}
                      </div>
                      <div className="text-[11px] mt-1 font-sans">
                        {isExpired ? (
                          <span className="text-rose-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Past Due
                          </span>
                        ) : loan.status === LoanStatus.REPAID ? (
                          <span className="text-[#553c9a] font-semibold">Settled on-time</span>
                        ) : (
                          <span className="text-[#525f6c]">Active grace period</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {loan.status === LoanStatus.ACTIVE && (
                    <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="text-xs text-[#707e8c] font-mono">
                        Snapshot Commitment: <span className="text-[#11161a]">{loan.snapshot_commitment.slice(0, 18)}...</span>
                      </div>
                      <button
                        onClick={() => handleOpenRepay(loan)}
                        className="bg-[#11161a] hover:bg-black text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-sm active:scale-95 transition flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-[#eaeae5] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative text-[#11161a]">
            <div className="flex items-center justify-between border-b border-[#eaeae5] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] text-[#11161a]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#11161a]">Loan Repayment</h3>
                  <p className="text-xs text-[#525f6c] font-mono">repayLoan() Circuit</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoanId(null)}
                className="p-1.5 rounded-full hover:bg-[#f5f5f0] text-[#707e8c] hover:text-[#11161a] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRepay} className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] font-mono text-xs space-y-2">
                <div className="flex justify-between text-[#525f6c]">
                  <span>Loan Principal:</span>
                  <span className="text-[#11161a] font-bold">{formatNight(selectedLoan.loan_amount)}</span>
                </div>
                <div className="flex justify-between text-[#525f6c]">
                  <span>Interest Rate:</span>
                  <span className="text-[#11161a] font-bold">{formatBps(selectedLoan.interest_rate_bps)}</span>
                </div>
                <div className="flex justify-between text-[#525f6c]">
                  <span>Total Due (Principal + Interest):</span>
                  <span className="text-[#11161a] font-bold">{formatNight(calculateTotalDue(selectedLoan))}</span>
                </div>
                <div className="flex justify-between text-[#525f6c]">
                  <span>Already Repaid:</span>
                  <span className="text-emerald-700 font-bold">{formatNight(selectedLoan.total_repaid)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#11161a] block mb-1.5">
                  Repayment Amount (NIGHT)
                </label>
                <input
                  type="number"
                  min="1"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full bg-[#f8f8f6] border border-[#d5d5cf] focus:border-[#11161a] focus:bg-white text-[#11161a] rounded-xl px-4 py-2.5 outline-none font-mono text-sm transition"
                  placeholder="e.g. 20000"
                  required
                />
                <span className="text-[11px] text-[#707e8c] mt-1 block">
                  Wallet Balance: <strong className="text-[#11161a]">{formatNight(userNightBalance)}</strong>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Collateral Release Automation</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed font-sans">
                  Once the total debt is satisfied in full, the contract instantly switches the state to <code>REPAID</code> and unlocks 100% of your escrowed collateral back to your wallet.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoanId(null)}
                  className="px-5 py-2.5 rounded-full border border-[#d5d5cf] hover:bg-[#f5f5f0] text-xs font-semibold text-[#11161a] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-[#11161a] hover:bg-black text-xs font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
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
