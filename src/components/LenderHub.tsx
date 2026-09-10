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
        term_duration: BigInt(termDays) * 86400n,
      });
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to deploy lending pool');
    } finally {
      setLoading(false);
    }
  };

  // Aggregate Metrics
  const totalDeposited = pools.reduce((acc, p) => acc + p.total_deposited, 0n);
  const totalLiquidity = pools.reduce((acc, p) => acc + p.pool_liquidity, 0n);
  const totalLent = pools.reduce((acc, p) => acc + p.total_lent, 0n);
  const poolCount = pools.length;
  
  const overallUtilization =
    totalDeposited > 0n ? Number((totalLent * 10000n) / totalDeposited) / 100 : 0;
    
  const weightedAprBps =
    totalDeposited > 0n
      ? Number(
          pools.reduce(
            (acc, p) => acc + BigInt(p.interest_rate_bps) * p.total_deposited,
            0n
          ) / totalDeposited
        )
      : 0;

  const avgMinCollateralBps =
    poolCount > 0
      ? Math.round(pools.reduce((acc, p) => acc + p.min_collateral_ratio_bps, 0) / poolCount)
      : 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#eaeae5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background Theme Banner */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: "url('/app-banner.jpg')", backgroundPosition: 'center 35%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30 pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f5f0] border border-[#d5d5cf] text-xs font-semibold text-[#525f6c]">
            <Coins className="w-3.5 h-3.5 text-[#11161a]" />
            <span>Liquidity Provider Portal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#11161a]">
            Lender Capital Pools
          </h1>
          <p className="text-sm sm:text-base text-[#525f6c] leading-relaxed">
            Deposit NIGHT into autonomous liquidity pools. Set public risk criteria—income floors, DTI ceilings, and collateral requirements. Borrowers prove qualification in ZK without ever exposing their confidential figures.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 bg-[#11161a] hover:bg-black text-white font-semibold text-sm px-6 py-3.5 rounded-full transition shadow-sm hover:shadow active:scale-95 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Deploy Lending Pool</span>
        </button>
      </div>

      {/* Aggregate On-Chain Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-5 rounded-2xl bg-white border border-[#eaeae5] shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-[#707e8c] uppercase tracking-wider">Protocol TVL</div>
          <div className="text-xl font-bold font-mono text-[#11161a] mt-2">
            {formatNight(totalDeposited)}
          </div>
          <div className="text-[10px] text-emerald-700 font-mono mt-1">Real Contract State</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#eaeae5] shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-[#707e8c] uppercase tracking-wider">Available Liquidity</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-2">
            {formatNight(totalLiquidity)}
          </div>
          <div className="text-[10px] text-emerald-700 font-mono mt-1">Ready for Borrowers</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#eaeae5] shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-[#707e8c] uppercase tracking-wider">Active Capital Lent</div>
          <div className="text-xl font-bold font-mono text-[#11161a] mt-2">
            {formatNight(totalLent)}
          </div>
          <div className="text-[10px] text-[#707e8c] font-mono mt-1">Secured by ZK Proofs</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#eaeae5] shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-[#707e8c] uppercase tracking-wider">Active Pools</div>
          <div className="text-xl font-bold font-mono text-[#11161a] mt-2">
            {poolCount} {poolCount === 1 ? 'Pool' : 'Pools'}
          </div>
          <div className="text-[10px] text-[#707e8c] font-mono mt-1">On Midnight Ledger</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#eaeae5] shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-[#707e8c] uppercase tracking-wider">Weighted APR</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-2">
            {formatBps(weightedAprBps)}
          </div>
          <div className="text-[10px] text-[#707e8c] font-mono mt-1">Volume Weighted</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#eaeae5] shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-[#707e8c] uppercase tracking-wider">Pool Utilization</div>
          <div className="text-xl font-bold font-mono text-[#11161a] mt-2">
            {overallUtilization.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#707e8c] font-mono mt-1">Min CR: {formatBps(avgMinCollateralBps)}</div>
        </div>
      </div>

      {/* Pools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-normal text-[#11161a] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#11161a]" />
            <span>Active Lending Pools ({pools.length})</span>
          </h3>
          <span className="text-xs text-[#707e8c] font-mono">
            Powered by Compact Circuit <code>createLendingPool()</code>
          </span>
        </div>

        {pools.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-[#eaeae5] text-center text-[#525f6c] space-y-3">
            <Coins className="w-10 h-10 text-[#9ca3af] mx-auto" />
            <h4 className="text-base font-bold text-[#11161a]">No Lending Pools Deployed Yet</h4>
            <p className="text-xs text-[#525f6c] max-w-md mx-auto">
              Be the first liquidity provider to deploy an autonomous lending facility on Midnight Preview.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#11161a] hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm mx-auto"
            >
              Deploy First Lending Pool
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pools.map((pool) => {
              const utilization =
                pool.total_deposited > 0n
                  ? Number((pool.total_lent * 10000n) / pool.total_deposited) / 100
                  : 0;

              return (
                <div
                  key={pool.pool_id}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eaeae5] space-y-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Pool Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#eaeae5] pb-4">
                      <div>
                        <div className="text-xs font-mono text-[#11161a] font-bold">
                          Pool {pool.pool_id.slice(0, 14)}...{pool.pool_id.slice(-6)}
                        </div>
                        <div className="text-xs text-[#707e8c] font-mono mt-0.5">
                          Lender: {pool.lender.slice(0, 10)}...
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        {formatBps(pool.interest_rate_bps)} Fixed APR
                      </span>
                    </div>

                    {/* Liquidity Meters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                        <div className="text-[11px] text-[#707e8c] uppercase font-semibold">Available Liquidity</div>
                        <div className="text-lg font-bold text-[#11161a] font-mono mt-0.5">
                          {formatNight(pool.pool_liquidity)}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5]">
                        <div className="text-[11px] text-[#707e8c] uppercase font-semibold">Total Lent Out</div>
                        <div className="text-lg font-bold text-[#11161a] font-mono mt-0.5">
                          {formatNight(pool.total_lent)}
                        </div>
                      </div>
                    </div>

                    {/* Underwriting Criteria (The ZK Constraints) */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#11161a] uppercase tracking-wider">
                        Public Underwriting Thresholds (ZK Constraints):
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-[#f5f5f0] border border-[#eaeae5]">
                          <span className="text-[#707e8c] block text-[10px]">Min Income</span>
                          <span className="text-[#11161a] font-bold">
                            ${Number(pool.min_income).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#f5f5f0] border border-[#eaeae5]">
                          <span className="text-[#707e8c] block text-[10px]">Max DTI</span>
                          <span className="text-[#11161a] font-bold">
                            {formatBps(pool.max_debt_to_income_bps)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#f5f5f0] border border-[#eaeae5]">
                          <span className="text-[#707e8c] block text-[10px]">Min Collateral</span>
                          <span className="text-[#11161a] font-bold">
                            {formatBps(pool.min_collateral_ratio_bps)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Utilization Bar */}
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between text-[11px] text-[#707e8c]">
                        <span>Utilization</span>
                        <span>{utilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#f0f0eb] rounded-full h-2 overflow-hidden border border-[#eaeae5]">
                        <div
                          className="bg-[#11161a] h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, utilization)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onSelectPoolForBorrow(pool.pool_id)}
                      className="w-full py-3 rounded-full bg-[#11161a] hover:bg-black text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm active:scale-95"
                    >
                      <span>Borrow from this pool</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Deploy Lending Pool */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="p-8 rounded-3xl bg-white border border-[#eaeae5] max-w-xl w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#eaeae5] pb-4">
              <div>
                <h3 className="text-xl font-serif text-[#11161a]">Deploy New Lending Pool</h3>
                <p className="text-xs text-[#525f6c]">Deposit NIGHT and configure risk underwriting rules</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#f5f5f0] text-[#707e8c] hover:text-[#11161a] transition"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#11161a] block mb-1">
                  Liquidity Deposit (NIGHT)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-[#f8f8f6] border border-[#d5d5cf] focus:border-[#11161a] text-[#11161a] font-mono text-sm rounded-xl px-4 py-2.5 outline-none"
                  placeholder="100000"
                  required
                />
                <span className="text-[10px] text-[#707e8c] mt-1 block">Balance: {formatNight(userNightBalance)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#11161a] block mb-1">
                    Min Borrower Income ($ USD)
                  </label>
                  <input
                    type="number"
                    value={minIncome}
                    onChange={(e) => setMinIncome(e.target.value)}
                    className="w-full bg-[#f8f8f6] border border-[#d5d5cf] focus:border-[#11161a] text-[#11161a] font-mono text-sm rounded-xl px-4 py-2.5 outline-none"
                    placeholder="60000"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#11161a] block mb-1">
                    Max Debt-to-Income (DTI %)
                  </label>
                  <input
                    type="number"
                    value={maxDti}
                    onChange={(e) => setMaxDti(e.target.value)}
                    className="w-full bg-[#f8f8f6] border border-[#d5d5cf] focus:border-[#11161a] text-[#11161a] font-mono text-sm rounded-xl px-4 py-2.5 outline-none"
                    placeholder="35"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#11161a] block mb-1">
                    Min Collateral Ratio (%)
                  </label>
                  <input
                    type="number"
                    value={minCollateralRatio}
                    onChange={(e) => setMinCollateralRatio(e.target.value)}
                    className="w-full bg-[#f8f8f6] border border-[#d5d5cf] focus:border-[#11161a] text-[#11161a] font-mono text-sm rounded-xl px-4 py-2.5 outline-none"
                    placeholder="150"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#11161a] block mb-1">
                    Interest Rate (APR %)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-[#f8f8f6] border border-[#d5d5cf] focus:border-[#11161a] text-[#11161a] font-mono text-sm rounded-xl px-4 py-2.5 outline-none"
                    placeholder="6.0"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#11161a] block mb-1">
                    Loan Term (Days)
                  </label>
                  <input
                    type="number"
                    value={termDays}
                    onChange={(e) => setTermDays(e.target.value)}
                    className="w-full bg-[#f8f8f6] border border-[#d5d5cf] focus:border-[#11161a] text-[#11161a] font-mono text-sm rounded-xl px-4 py-2.5 outline-none"
                    placeholder="30"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#d5d5cf] text-[#525f6c] hover:text-[#11161a] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#11161a] hover:bg-black text-white px-6 py-2.5 rounded-full font-semibold shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Deploying on Midnight...' : 'Deploy Lending Pool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
