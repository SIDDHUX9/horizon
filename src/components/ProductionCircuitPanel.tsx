import React, { useState } from 'react';
import { Activity, Coins, FileLock2, Landmark, Receipt, ShieldAlert } from 'lucide-react';
import { explorerContractUrl } from '../services/explorerUrls';
import type {
  FinancialSnapshot,
  LendingPool,
  Loan,
  ZKProofTrace,
} from '../types/horizon';

interface ProductionCircuitPanelProps {
  readonly pools: LendingPool[];
  readonly loans: Loan[];
  readonly contractAddress: string;
  readonly blockHeight: number;
  readonly userAddress: string;
  readonly userNightBalance: bigint;
  readonly onCreatePool: (params: {
    deposit_amount: bigint;
    min_income: bigint;
    max_debt_to_income_bps: number;
    min_collateral_ratio_bps: number;
    interest_rate_bps: number;
    term_duration: bigint;
  }) => Promise<void>;
  readonly onSnapshotSubmitted: (
    borrower: string,
    snapshot: FinancialSnapshot
  ) => Promise<string>;
  readonly onRequestLoan: (params: {
    pool_id: string;
    borrower: string;
    requested_amount: bigint;
    collateral_deposit: bigint;
    snapshot_witness: FinancialSnapshot;
  }) => Promise<ZKProofTrace>;
  readonly onRepayLoan: (loanId: string, amount: bigint) => Promise<boolean>;
  readonly onLiquidate: (loanId: string) => Promise<void>;
}

function randomHex32(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function formatUnits(value: bigint): string {
  return (Number(value) / 1_000_000).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

const inputClass =
  'mt-1 w-full rounded-xl border border-[#d5d5cf] bg-white px-3 py-2 font-mono text-xs text-[#11161a] outline-none focus:border-[#11161a]';
const buttonClass =
  'w-full rounded-full bg-[#11161a] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50';

export const ProductionCircuitPanel: React.FC<ProductionCircuitPanelProps> = ({
  pools,
  loans,
  contractAddress,
  blockHeight,
  userAddress,
  userNightBalance,
  onCreatePool,
  onSnapshotSubmitted,
  onRequestLoan,
  onRepayLoan,
  onLiquidate,
}) => {
  const [busy, setBusy] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [snapshotSalt, setSnapshotSalt] = useState<string | null>(null);
  const [snapshotIncome, setSnapshotIncome] = useState('60000');
  const [snapshotDebt, setSnapshotDebt] = useState('10000');
  const [snapshotDti, setSnapshotDti] = useState('1667');
  const [snapshotCollateral, setSnapshotCollateral] = useState('20000');
  const [poolDeposit, setPoolDeposit] = useState('100000');
  const [poolMinIncome, setPoolMinIncome] = useState('50000');
  const [poolMaxDti, setPoolMaxDti] = useState('4000');
  const [poolMinCollateral, setPoolMinCollateral] = useState('15000');
  const [poolInterest, setPoolInterest] = useState('600');
  const [poolTermDays, setPoolTermDays] = useState('30');
  const [loanPoolId, setLoanPoolId] = useState(pools[0]?.pool_id || '');
  const [loanAmount, setLoanAmount] = useState('50000');
  const [loanCollateral, setLoanCollateral] = useState('75000');
  const [repayLoanId, setRepayLoanId] = useState(loans[0]?.loan_id || '');
  const [repayAmount, setRepayAmount] = useState('10000');
  const [liquidateLoanId, setLiquidateLoanId] = useState(loans[0]?.loan_id || '');

  const run = async (label: string, action: () => Promise<void>) => {
    setBusy(label);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  const currentSnapshot = (): FinancialSnapshot => ({
    actual_income: BigInt(snapshotIncome),
    existing_debt: BigInt(snapshotDebt),
    computed_dti_ratio: Number(snapshotDti),
    computed_collateral_ratio: Number(snapshotCollateral),
    salt: snapshotSalt || randomHex32(),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eaeae5] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Activity className="w-3.5 h-3.5" />
              Verified contract attached
            </div>
            <h1 className="font-serif text-3xl font-normal text-[#11161a] mt-1">
              Production Protocol Console
            </h1>
          </div>
          <div className="text-right text-xs font-mono text-[#707e8c]">
            <div>Block #{blockHeight || 'pending'}</div>
            <div>Available: {formatUnits(userNightBalance)} NIGHT</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-[#707e8c] font-semibold">
              Contract
            </div>
            <div className="font-mono text-xs break-all text-[#11161a]">{contractAddress}</div>
          </div>
          <a
            href={explorerContractUrl(contractAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#11161a] underline"
          >
            View on Explorer
          </a>
        </div>
        {lastTx && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-900 break-all">
            Last submitted transaction: {lastTx}. Confirm settlement on the indexer before treating it as final.
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          className="p-6 rounded-3xl bg-white border border-[#eaeae5] shadow-sm space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void run('createLendingPool', async () => {
              await onCreatePool({
                deposit_amount: BigInt(poolDeposit),
                min_income: BigInt(poolMinIncome),
                max_debt_to_income_bps: Number(poolMaxDti),
                min_collateral_ratio_bps: Number(poolMinCollateral),
                interest_rate_bps: Number(poolInterest),
                term_duration: BigInt(poolTermDays) * 86400n,
              });
            });
          }}
        >
          <h2 className="font-serif text-xl text-[#11161a] flex items-center gap-2">
            <Coins className="w-4 h-4" /> Create lending pool
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">Deposit<input className={inputClass} value={poolDeposit} onChange={(e) => setPoolDeposit(e.target.value)} /></label>
            <label className="text-xs">Min income<input className={inputClass} value={poolMinIncome} onChange={(e) => setPoolMinIncome(e.target.value)} /></label>
            <label className="text-xs">Max DTI (bps)<input className={inputClass} value={poolMaxDti} onChange={(e) => setPoolMaxDti(e.target.value)} /></label>
            <label className="text-xs">Min collateral (bps)<input className={inputClass} value={poolMinCollateral} onChange={(e) => setPoolMinCollateral(e.target.value)} /></label>
            <label className="text-xs">Interest (bps)<input className={inputClass} value={poolInterest} onChange={(e) => setPoolInterest(e.target.value)} /></label>
            <label className="text-xs">Term (days)<input className={inputClass} value={poolTermDays} onChange={(e) => setPoolTermDays(e.target.value)} /></label>
          </div>
          <button className={buttonClass} disabled={busy !== null}>
            {busy === 'createLendingPool' ? 'Submitting…' : 'Submit createLendingPool'}
          </button>
        </form>

        <form
          className="p-6 rounded-3xl bg-white border border-[#eaeae5] shadow-sm space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void run('submitFinancialSnapshot', async () => {
              const snapshot = currentSnapshot();
              const txId = await onSnapshotSubmitted(userAddress, snapshot);
              setSnapshotSalt(snapshot.salt);
              setLastTx(txId);
            });
          }}
        >
          <h2 className="font-serif text-xl text-[#11161a] flex items-center gap-2">
            <FileLock2 className="w-4 h-4" /> Submit snapshot commitment
          </h2>
          <p className="text-xs text-[#525f6c]">
            Values stay in encrypted private state. Only the commitment is published.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">Actual income<input className={inputClass} value={snapshotIncome} onChange={(e) => setSnapshotIncome(e.target.value)} /></label>
            <label className="text-xs">Existing debt<input className={inputClass} value={snapshotDebt} onChange={(e) => setSnapshotDebt(e.target.value)} /></label>
            <label className="text-xs">DTI (bps)<input className={inputClass} value={snapshotDti} onChange={(e) => setSnapshotDti(e.target.value)} /></label>
            <label className="text-xs">Collateral ratio (bps)<input className={inputClass} value={snapshotCollateral} onChange={(e) => setSnapshotCollateral(e.target.value)} /></label>
          </div>
          <button className={buttonClass} disabled={busy !== null}>
            {busy === 'submitFinancialSnapshot' ? 'Submitting…' : 'Submit submitFinancialSnapshot'}
          </button>
        </form>

        <form
          className="p-6 rounded-3xl bg-white border border-[#eaeae5] shadow-sm space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void run('requestLoan', async () => {
              const trace = await onRequestLoan({
                pool_id: loanPoolId,
                borrower: userAddress,
                requested_amount: BigInt(loanAmount),
                collateral_deposit: BigInt(loanCollateral),
                snapshot_witness: currentSnapshot(),
              });
              setLastTx(trace.tx_hash || null);
            });
          }}
        >
          <h2 className="font-serif text-xl text-[#11161a] flex items-center gap-2">
            <Landmark className="w-4 h-4" /> Request loan
          </h2>
          <label className="text-xs block">
            Pool
            <select className={inputClass} value={loanPoolId} onChange={(e) => setLoanPoolId(e.target.value)}>
              {pools.map((pool) => (
                <option key={pool.pool_id} value={pool.pool_id}>{pool.pool_id.slice(0, 12)}…</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">Requested amount<input className={inputClass} value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} /></label>
            <label className="text-xs">Collateral deposit<input className={inputClass} value={loanCollateral} onChange={(e) => setLoanCollateral(e.target.value)} /></label>
          </div>
          <button className={buttonClass} disabled={busy !== null || pools.length === 0}>
            {busy === 'requestLoan' ? 'Submitting…' : 'Submit requestLoan'}
          </button>
        </form>

        <div className="space-y-6">
          <form
            className="p-6 rounded-3xl bg-white border border-[#eaeae5] shadow-sm space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void run('repayLoan', async () => {
                await onRepayLoan(repayLoanId, BigInt(repayAmount));
              });
            }}
          >
            <h2 className="font-serif text-xl text-[#11161a] flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Repay loan
            </h2>
            <label className="text-xs block">
              Loan
              <select className={inputClass} value={repayLoanId} onChange={(e) => setRepayLoanId(e.target.value)}>
                {loans.map((loan) => (
                  <option key={loan.loan_id} value={loan.loan_id}>{loan.loan_id.slice(0, 12)}…</option>
                ))}
              </select>
            </label>
            <label className="text-xs block">Repayment amount<input className={inputClass} value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} /></label>
            <button className={buttonClass} disabled={busy !== null || loans.length === 0}>
              {busy === 'repayLoan' ? 'Submitting…' : 'Submit repayLoan'}
            </button>
          </form>

          <form
            className="p-6 rounded-3xl bg-white border border-[#eaeae5] shadow-sm space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void run('liquidate', async () => {
                await onLiquidate(liquidateLoanId);
              });
            }}
          >
            <h2 className="font-serif text-xl text-[#11161a] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Liquidate overdue loan
            </h2>
            <label className="text-xs block">
              Loan
              <select className={inputClass} value={liquidateLoanId} onChange={(e) => setLiquidateLoanId(e.target.value)}>
                {loans.map((loan) => (
                  <option key={loan.loan_id} value={loan.loan_id}>{loan.loan_id.slice(0, 12)}…</option>
                ))}
              </select>
            </label>
            <button className={buttonClass} disabled={busy !== null || loans.length === 0}>
              {busy === 'liquidate' ? 'Submitting…' : 'Submit liquidate'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
