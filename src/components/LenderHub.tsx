import React, { useState } from 'react';
import { 
  Coins, 
  PlusCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Percent, 
  Clock, 
  DollarSign, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';
import { LendingPool } from '../types/horizon';
import { formatNight, formatBps } from '../contracts/horizonSimulator';

interface LenderHubProps {
  pools: LendingPool[];
  onCreatePool: (params: {
    deposit_amount: bigint;
    min_income: bigint;
    max_debt_to_income_bps: number;
    min_collateral_ratio_bps: number;
    interest_rate_bps: number;
    term_duration: bigint;
  }) => Promise<void>;
  onSelectPoolForBorrow: (poolId: string) => void;
  userNightBalance: bigint;
}

export const LenderHub: React.FC<LenderHubProps> = ({
  pools,
  onCreatePool,
  onSelectPoolForBorrow,
  userNightBalance,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [depositAmount, setDepositAmount] = useState('100000');
  const [minIncome, setMinIncome] = useState('60000');
  const [maxDti, setMaxDti] = useState('35'); // 35%
  const [minCollateralRatio, setMinCollateralRatio] = useState('150'); // 150%
  const [interestRate, setInterestRate] = useState('6.0'); // 6.0%
  const [termDays, setTermDays] = useState('30'); // 30 days

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const deposit = BigInt(depositAmount);
      if (deposit > userNightBalance) {
        throw new Error(`Insufficient wallet balance. You have ${formatNight(userNightBalance)}.`);
      }
      await onCreatePool({
        deposit_amount: deposit,
        min_income: BigInt(minIncome),
        max_debt_to_income_bps: Math.round(parseFloat(maxDti) * 100),
        min_collateral_ratio_bps: Math.round(parseFloat(minCollateralRatio) * 100),
        interest_rate_bps: Math.round(parseFloat(interestRate) * 100),
        term_duration: BigInt(parseInt(termDays)) * 86400n,
      });
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create lending pool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Coins className="w-4 h-4" />
            <span>Liquidity Provider Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Lender Capital Pools</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Deposit NIGHT liquidity into public escrow pools. Define custom risk underwriting parameters—borrowers will prove compliance in ZK without ever exposing their confidential income or debt.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary shrink-0 text-sm !py-3 !px-5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Deploy New Lending Pool</span>
        </button>
      </div>

      {/* Pools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Active Public Lending Pools ({pools.length})</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Powered by Midnight Compact Circuit <code>createLendingPool()</code>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pools.map((pool) => {
            const utilization =
              pool.total_deposited > 0n
                ? Number((pool.total_lent * 10000n) / pool.total_deposited) / 100
                : 0;

            return (
              <div
                key={pool.pool_id}
                className="glass-panel p-6 space-y-6 hover:border-cyan-500/40 transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Pool Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs font-mono text-cyan-400">
                        Pool ID: {pool.pool_id.slice(0, 14)}...{pool.pool_id.slice(-6)}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Lender: {pool.lender.slice(0, 10)}...
                      </div>
                    </div>
                    <span className="badge badge-active text-[10px]">
                      {formatBps(pool.interest_rate_bps)} Fixed APR
                    </span>
                  </div>

                  {/* Liquidity Meters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Available Liquidity</div>
                      <div className="text-lg font-bold text-white font-mono mt-0.5">
                        {formatNight(pool.pool_liquidity)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Lent Out</div>
                      <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                        {formatNight(pool.total_lent)}
                      </div>
                    </div>
                  </div>

                  {/* Underwriting Criteria (The ZK Constraints) */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Public Underwriting Criteria (ZK Constraints):
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500">Min Income Floor</div>
                        <div className="text-emerald-400 font-bold">${Number(pool.min_income).toLocaleString()}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500">Max DTI Ceiling</div>
                        <div className="text-amber-400 font-bold">{formatBps(pool.max_debt_to_income_bps)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500">Min Collateral</div>
                        <div className="text-purple-400 font-bold">{formatBps(pool.min_collateral_ratio_bps)}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Term Duration: {Math.floor(Number(pool.term_duration) / 86400)} Days</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-mono">
                    Pool Utilization: <span className="text-white font-bold">{utilization.toFixed(1)}%</span>
                  </div>
                  <button
                    onClick={() => onSelectPoolForBorrow(pool.pool_id)}
                    className="btn-secondary text-xs !py-2 !px-3 hover:border-cyan-400"
                  >
                    <span>Borrow Against Pool</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Creating New Lending Pool */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel p-6 sm:p-8 max-w-lg w-full space-y-6 border-cyan-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Deploy Lending Pool</h3>
                  <p className="text-xs text-slate-400">Calls <code>createLendingPool()</code> on Midnight</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition text-lg"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  NIGHT Liquidity to Deposit
                </label>
                <input
                  type="number"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="input-field font-mono"
                  placeholder="e.g. 100000"
                  required
                />
                <span className="text-[11px] text-slate-400">Available: {formatNight(userNightBalance)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Min Income Floor ($ USD)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minIncome}
                    onChange={(e) => setMinIncome(e.target.value)}
                    className="input-field font-mono"
                    placeholder="e.g. 50000"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Max DTI Ratio (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    value={maxDti}
                    onChange={(e) => setMaxDti(e.target.value)}
                    className="input-field font-mono"
                    placeholder="e.g. 40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Min Collateral (%)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={minCollateralRatio}
                    onChange={(e) => setMinCollateralRatio(e.target.value)}
                    className="input-field font-mono"
                    placeholder="e.g. 150"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="input-field font-mono"
                    placeholder="e.g. 5.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Term (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={termDays}
                    onChange={(e) => setTermDays(e.target.value)}
                    className="input-field font-mono"
                    placeholder="e.g. 30"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Automatic Midnight ZK Verification:</span>
                </div>
                <p>
                  Borrowers applying to this pool must submit a ZK proof satisfying all 3 inequalities (Income ≥ floor, DTI ≤ ceiling, Collateral Ratio ≥ floor).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs"
                >
                  {loading ? 'Submitting to Midnight...' : 'Confirm Pool Deployment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
