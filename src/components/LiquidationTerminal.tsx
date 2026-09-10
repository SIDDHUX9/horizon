import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  FastForward, 
  CheckCircle2, 
  Lock, 
  HelpCircle,
  Coins,
  Flame
} from 'lucide-react';
import { Loan, LoanStatus } from '../types/horizon';
import { formatNight, formatBps } from '../contracts/horizonSimulator';

interface LiquidationTerminalProps {
  loans: Loan[];
  currentTime: bigint;
  onAdvanceTime: (days: number) => void;
  onLiquidate: (loanId: string) => Promise<void>;
}

export const LiquidationTerminal: React.FC<LiquidationTerminalProps> = ({
  loans,
  currentTime,
  onAdvanceTime,
  onLiquidate,
}) => {
  const [loadingLoanId, setLoadingLoanId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeLoans = loans.filter((l) => l.status === LoanStatus.ACTIVE);
  const liquidatedLoans = loans.filter((l) => l.status === LoanStatus.LIQUIDATED);

  const handleLiquidate = async (loanId: string) => {
    setLoadingLoanId(loanId);
    setMsg(null);
    setErrorMsg(null);
    try {
      await onLiquidate(loanId);
      setMsg(`Loan ${loanId.slice(0, 12)}... permissionlessly liquidated! Collateral credited to pool.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Liquidation failed');
    } finally {
      setLoadingLoanId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Hero Banner */}
      <div className="bg-white border border-[#eaeae5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background Theme Banner */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: "url('/app-banner.jpg')", backgroundPosition: 'center 50%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30 pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Permissionless Protocol Liquidation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#11161a] tracking-tight">Default Resolution Engine</h2>
          <p className="text-sm text-[#525f6c] leading-relaxed">
            In Horizon on Midnight, <code>liquidate()</code> is strictly permissionless: <strong>any network actor or automated bot</strong> can trigger resolution as soon as a loan lapses its timestamp deadline without full repayment.
          </p>
        </div>

        {/* Time Simulator CTA */}
        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#eaeae5] space-y-2.5 shrink-0 relative z-10 shadow-xs">
          <div className="text-xs font-bold text-[#11161a] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#525f6c]" />
            <span>Simulate Time Expiration:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdvanceTime(10)}
              className="px-3.5 py-1.5 rounded-full border border-[#d5d5cf] bg-white hover:bg-[#f2f2ee] text-xs font-semibold text-[#11161a] transition flex items-center gap-1.5 shadow-sm"
            >
              <FastForward className="w-3 h-3 text-amber-600" />
              <span>+10 Days</span>
            </button>
            <button
              onClick={() => onAdvanceTime(35)}
              className="px-3.5 py-1.5 rounded-full border border-[#d5d5cf] bg-white hover:bg-[#f2f2ee] text-xs font-semibold text-[#11161a] transition flex items-center gap-1.5 shadow-sm"
            >
              <FastForward className="w-3 h-3 text-rose-600" />
              <span>+35 Days</span>
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-mono shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 font-mono shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Eligible Loans for Liquidation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#11161a] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Active Loans Audit ({activeLoans.length})</span>
          </h3>
          <span className="text-xs font-mono text-[#707e8c]">{activeLoans.length} active positions</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {activeLoans.length === 0 ? (
            <div className="bg-white border border-[#eaeae5] rounded-3xl p-10 text-center text-[#707e8c] text-xs shadow-sm">
              No active loans currently recorded in the protocol.
            </div>
          ) : (
            activeLoans.map((loan) => {
              const isPastDue = currentTime > loan.due_date;
              const remainingSeconds = Number(loan.due_date - currentTime);
              const dueDateObj = new Date(Number(loan.due_date) * 1000);

              return (
                <div
                  key={loan.loan_id}
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-sm ${
                    isPastDue 
                      ? 'bg-rose-50/40 border-2 border-rose-300' 
                      : 'bg-white border border-[#eaeae5]'
                  }`}
                >
                  <div className="space-y-3 font-mono">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        isPastDue
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isPastDue ? (
                          <>
                            <Flame className="w-3 h-3 text-rose-600 animate-pulse" />
                            ELIGIBLE FOR LIQUIDATION
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            WITHIN DUE DATE
                          </>
                        )}
                      </span>
                      <span className="text-xs text-[#11161a] font-bold">
                        Loan {loan.loan_id.slice(0, 16)}...
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs pt-1 font-sans">
                      <div>
                        <span className="text-[#707e8c] block text-[11px] font-medium uppercase tracking-wider">Principal Debt</span>
                        <span className="text-[#11161a] font-bold font-mono text-sm mt-0.5 block">{formatNight(loan.loan_amount)}</span>
                      </div>
                      <div>
                        <span className="text-[#707e8c] block text-[11px] font-medium uppercase tracking-wider">Collateral At Stake</span>
                        <span className="text-emerald-700 font-bold font-mono text-sm mt-0.5 block">{formatNight(loan.collateral_locked)}</span>
                      </div>
                      <div>
                        <span className="text-[#707e8c] block text-[11px] font-medium uppercase tracking-wider">Deadline</span>
                        <span className={`font-semibold text-xs mt-0.5 block ${isPastDue ? 'text-rose-700 font-bold' : 'text-[#11161a]'}`}>
                          {dueDateObj.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-[#eaeae5]">
                    {isPastDue ? (
                      <button
                        onClick={() => handleLiquidate(loan.loan_id)}
                        disabled={loadingLoanId === loan.loan_id}
                        className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-sm active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>
                          {loadingLoanId === loan.loan_id
                            ? 'Executing Liquidation...'
                            : 'Permissionless Liquidate'}
                        </span>
                      </button>
                    ) : (
                      <div className="text-xs text-[#525f6c] font-mono text-right">
                        <div>Due in: {Math.floor(remainingSeconds / 86400)}d {Math.floor((remainingSeconds % 86400) / 3600)}h</div>
                        <div className="text-[11px] text-[#707e8c] font-sans">Not yet liquidatable</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Historical Liquidations */}
      {liquidatedLoans.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-[#11161a] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-600" />
            <span>Liquidated Loan History ({liquidatedLoans.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {liquidatedLoans.map((loan) => (
              <div
                key={loan.loan_id}
                className="bg-white border border-[#eaeae5] rounded-3xl p-5 space-y-2 text-xs font-mono shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                    LIQUIDATED
                  </span>
                  <span className="text-[#707e8c]">{loan.loan_id.slice(0, 16)}...</span>
                </div>
                <div className="text-[#11161a] font-sans text-xs">
                  Principal: <strong className="font-mono">{formatNight(loan.loan_amount)}</strong> • Collateral Seized: <strong className="font-mono text-rose-700">{formatNight(loan.collateral_locked)}</strong>
                </div>
                <div className="text-[11px] text-[#707e8c] font-sans">
                  Collateral transferred to pool liquidity to reimburse lenders and maintain protocol solvency.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
