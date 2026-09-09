import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  FastForward, 
  CheckCircle2, 
  Lock, 
  HelpCircle,
  Coins
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
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Permissionless Protocol Liquidation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Default Resolution Engine</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            In Horizon on Midnight, <code>liquidate()</code> is strictly permissionless: <strong>any network actor or bot</strong> can trigger liquidation as soon as a loan passes its due date without full repayment.
          </p>
        </div>

        {/* Time Simulator CTA */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 shrink-0">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Time Expiration:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdvanceTime(10)}
              className="btn-secondary text-xs !py-1.5 !px-3"
            >
              <FastForward className="w-3 h-3 text-amber-400" />
              <span>+10 Days</span>
            </button>
            <button
              onClick={() => onAdvanceTime(35)}
              className="btn-secondary text-xs !py-1.5 !px-3"
            >
              <FastForward className="w-3 h-3 text-rose-400" />
              <span>+35 Days</span>
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Eligible Loans for Liquidation */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Active Loans Audit ({activeLoans.length})</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {activeLoans.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 text-xs">
              No active loans currently eligible or pending in the protocol.
            </div>
          ) : (
            activeLoans.map((loan) => {
              const isPastDue = currentTime > loan.due_date;
              const remainingSeconds = Number(loan.due_date - currentTime);
              const dueDateObj = new Date(Number(loan.due_date) * 1000);

              return (
                <div
                  key={loan.loan_id}
                  className={`glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${
                    isPastDue ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center gap-3">
                      <span className={`badge ${isPastDue ? 'badge-liquidated' : 'badge-active'} text-[10px]`}>
                        {isPastDue ? 'ELIGIBLE FOR LIQUIDATION' : 'WITHIN DUE DATE'}
                      </span>
                      <span className="text-xs text-cyan-400 font-bold">
                        Loan {loan.loan_id.slice(0, 16)}...
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Principal Debt:</span>
                        <span className="text-white font-bold">{formatNight(loan.loan_amount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Collateral At Stake:</span>
                        <span className="text-emerald-400 font-bold">{formatNight(loan.collateral_locked)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Deadline:</span>
                        <span className={isPastDue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {dueDateObj.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {isPastDue ? (
                      <button
                        onClick={() => handleLiquidate(loan.loan_id)}
                        disabled={loadingLoanId === loan.loan_id}
                        className="btn-danger text-xs !py-2.5 !px-4"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>
                          {loadingLoanId === loan.loan_id
                            ? 'Executing Liquidation...'
                            : 'Permissionless Liquidate'}
                        </span>
                      </button>
                    ) : (
                      <div className="text-xs text-slate-400 font-mono text-right">
                        <div>Due in: {Math.floor(remainingSeconds / 86400)}d {Math.floor((remainingSeconds % 86400) / 3600)}h</div>
                        <div className="text-[10px] text-slate-500">Not yet liquidatable</div>
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
          <h3 className="text-base font-bold text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-400" />
            <span>Liquidated Loan History ({liquidatedLoans.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {liquidatedLoans.map((loan) => (
              <div
                key={loan.loan_id}
                className="glass-panel p-4 space-y-2 border-slate-800 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-bold">LIQUIDATED</span>
                  <span className="text-slate-500">{loan.loan_id.slice(0, 14)}...</span>
                </div>
                <div className="text-slate-300">
                  Principal: {formatNight(loan.loan_amount)} • Collateral Seized: 0 NIGHT
                </div>
                <div className="text-[10px] text-slate-500">
                  Collateral transferred to pool liquidity to reimburse lenders.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
