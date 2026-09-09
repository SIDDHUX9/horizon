import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Shuffle, 
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LendingPool, FinancialSnapshot, ZKProofTrace } from '../types/horizon';
import { 
  formatNight, 
  formatBps, 
  computeSnapshotCommitment, 
  generateRandomHex 
} from '../contracts/horizonSimulator';

interface BorrowerStudioProps {
  pools: LendingPool[];
  selectedPoolId?: string;
  onSnapshotSubmitted: (borrower: string, snapshot: FinancialSnapshot) => Promise<string>;
  onRequestLoan: (params: {
    pool_id: string;
    borrower: string;
    requested_amount: bigint;
    collateral_deposit: bigint;
    snapshot_witness: FinancialSnapshot;
  }) => Promise<ZKProofTrace>;
  userNightBalance: bigint;
  currentCommitment?: string;
  borrowerAddress: string;
}

export const BorrowerStudio: React.FC<BorrowerStudioProps> = ({
  pools,
  selectedPoolId,
  onSnapshotSubmitted,
  onRequestLoan,
  userNightBalance,
  currentCommitment,
  borrowerAddress,
}) => {
  // Financial profile private inputs
  const [actualIncome, setActualIncome] = useState<string>('85000');
  const [existingDebt, setExistingDebt] = useState<string>('24000');
  const [collateralDeposit, setCollateralDeposit] = useState<string>('60000');
  const [requestedAmount, setRequestedAmount] = useState<string>('40000');
  const [salt, setSalt] = useState<string>(() => generateRandomHex(32));

  const [selectedPool, setSelectedPool] = useState<string>(
    selectedPoolId || (pools[0] ? pools[0].pool_id : '')
  );

  useEffect(() => {
    if (selectedPoolId) {
      setSelectedPool(selectedPoolId);
    } else if (pools.length > 0 && !selectedPool) {
      setSelectedPool(pools[0].pool_id);
    }
  }, [selectedPoolId, pools]);

  // Computed ratios in local memory
  const incomeNum = Math.max(1, parseFloat(actualIncome) || 0);
  const debtNum = parseFloat(existingDebt) || 0;
  const reqAmountNum = Math.max(1, parseFloat(requestedAmount) || 0);
  const colDepositNum = parseFloat(collateralDeposit) || 0;

  const computedDtiBps = Math.round((debtNum / incomeNum) * 10000);
  const computedCrBps = Math.round((colDepositNum / reqAmountNum) * 10000);

  // Live commitment preview
  const [previewCommitment, setPreviewCommitment] = useState<string>('');
  useEffect(() => {
    const snap: FinancialSnapshot = {
      actual_income: BigInt(actualIncome || '0'),
      existing_debt: BigInt(existingDebt || '0'),
      computed_dti_ratio: computedDtiBps,
      computed_collateral_ratio: computedCrBps,
      salt,
    };
    computeSnapshotCommitment(snap).then(setPreviewCommitment);
  }, [actualIncome, existingDebt, computedDtiBps, computedCrBps, salt]);

  // Status & states
  const [submittingSnapshot, setSubmittingSnapshot] = useState(false);
  const [provingLoan, setProvingLoan] = useState(false);
  const [proofStep, setProofStep] = useState<string>('');
  const [lastProofTrace, setLastProofTrace] = useState<ZKProofTrace | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activePool = pools.find((p) => p.pool_id === selectedPool);

  // Checks preview
  const incomePasses = activePool ? BigInt(actualIncome || '0') >= activePool.min_income : false;
  const dtiPasses = activePool ? computedDtiBps <= activePool.max_debt_to_income_bps : false;
  const crPasses = activePool ? computedCrBps >= activePool.min_collateral_ratio_bps : false;
  const allCriteriaMet = incomePasses && dtiPasses && crPasses;

  // Handler: Register snapshot commitment on Midnight
  const handleRegisterSnapshot = async () => {
    setErrorMsg(null);
    setSubmittingSnapshot(true);
    try {
      const snap: FinancialSnapshot = {
        actual_income: BigInt(actualIncome),
        existing_debt: BigInt(existingDebt),
        computed_dti_ratio: computedDtiBps,
        computed_collateral_ratio: computedCrBps,
        salt,
      };
      await onSnapshotSubmitted(borrowerAddress, snap);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit snapshot commitment');
    } finally {
      setSubmittingSnapshot(false);
    }
  };

  // Handler: Execute ZK circuit requestLoan
  const handleRequestLoan = async () => {
    if (!activePool) return;
    setErrorMsg(null);
    setProvingLoan(true);
    setProofStep('1/4: Initializing Midnight ZK Prover & loading secret witness...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProofStep('2/4: Evaluating in-circuit inequalities: (Income ≥ floor, DTI ≤ ceiling)...');
      await new Promise((r) => setTimeout(r, 600));
      setProofStep('3/4: Generating ZK proof with keys/requestLoan.prover & ZKIR constraints...');
      await new Promise((r) => setTimeout(r, 700));
      setProofStep('4/4: Midnight runtime verifying proof and updating on-chain ledger...');

      const snapWitness: FinancialSnapshot = {
        actual_income: BigInt(actualIncome),
        existing_debt: BigInt(existingDebt),
        computed_dti_ratio: computedDtiBps,
        computed_collateral_ratio: computedCrBps,
        salt,
      };

      const trace = await onRequestLoan({
        pool_id: activePool.pool_id,
        borrower: borrowerAddress,
        requested_amount: BigInt(requestedAmount),
        collateral_deposit: BigInt(collateralDeposit),
        snapshot_witness: snapWitness,
      });

      setLastProofTrace(trace);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Loan request failed');
    } finally {
      setProvingLoan(false);
      setProofStep('');
    }
  };

  // Fast test preset toggles
  const applyPreset = (type: 'qualifying' | 'unqualifying_income' | 'unqualifying_dti') => {
    if (type === 'qualifying') {
      setActualIncome('95000');
      setExistingDebt('18000');
      setRequestedAmount('30000');
      setCollateralDeposit('45000');
    } else if (type === 'unqualifying_income') {
      setActualIncome('28000'); // Below $50k floor
      setExistingDebt('10000');
      setRequestedAmount('20000');
      setCollateralDeposit('35000');
    } else if (type === 'unqualifying_dti') {
      setActualIncome('60000');
      setExistingDebt('45000'); // 75% DTI, exceeds 40% ceiling
      setRequestedAmount('20000');
      setCollateralDeposit('35000');
    }
    setSalt(generateRandomHex(32));
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="glass-panel p-6 sm:p-8 border-purple-500/20 relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Borrower Privacy Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Confidential Financial Snapshot & ZK Underwriting
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Borrowers enter their sensitive financial data locally. This raw data is never exposed. A cryptographic hash commitment is published, and when requesting a loan, a Zero-Knowledge proof asserts that your financial ratios meet the lender's criteria.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Quick Test Scenarios:</span>
          <button
            onClick={() => applyPreset('qualifying')}
            className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
          >
            ✓ Qualifying Borrower ($95k income, 19% DTI)
          </button>
          <button
            onClick={() => applyPreset('unqualifying_income')}
            className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition"
          >
            ✗ Sub-Threshold Income ($28k &lt; $50k floor)
          </button>
          <button
            onClick={() => applyPreset('unqualifying_dti')}
            className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition"
          >
            ✗ High Debt-to-Income (75% &gt; 40% ceiling)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <div className="font-bold">Execution Error:</div>
            <div className="text-xs text-rose-200 mt-0.5 font-mono">{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Two Column Workflow: Step 1 (Snapshot) & Step 2 (Request Loan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step 1: Confidential Financial Snapshot Studio (Cols 6) */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs flex items-center justify-center font-bold border border-purple-500/40">
                  1
                </span>
                <h3 className="text-lg font-bold text-white">Confidential Financial Snapshot</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Client-Side Only
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200/90 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>Confidentiality Guarantee:</strong> These fields will never leave your browser memory. Midnight uses them solely inside witness execution to generate the cryptographic commitment hash below.
              </span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Borrower's Actual Income ($ USD)
                </label>
                <input
                  type="number"
                  value={actualIncome}
                  onChange={(e) => setActualIncome(e.target.value)}
                  className="input-field font-mono"
                  placeholder="85000"
                />
                <span className="text-[10px] text-slate-500">Never disclosed publicly</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Existing Debt Obligations ($ USD)
                </label>
                <input
                  type="number"
                  value={existingDebt}
                  onChange={(e) => setExistingDebt(e.target.value)}
                  className="input-field font-mono"
                  placeholder="24000"
                />
                <span className="text-[10px] text-slate-500">Mortgages, loans, cards</span>
              </div>
            </div>

            {/* Computed Local Ratios */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Locally Computed Ratios:
              </div>
              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Computed DTI Ratio</div>
                  <div className="text-base font-bold text-cyan-300">{formatBps(computedDtiBps)}</div>
                  <div className="text-[9px] text-slate-400 font-sans mt-0.5">({existingDebt} / {actualIncome})</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Computed Collateral Ratio</div>
                  <div className="text-base font-bold text-emerald-300">{formatBps(computedCrBps)}</div>
                  <div className="text-[9px] text-slate-400 font-sans mt-0.5">({collateralDeposit} col / {requestedAmount} req)</div>
                </div>
              </div>
            </div>

            {/* Salt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  256-Bit Secret Blinding Entropy (Salt)
                </label>
                <button
                  type="button"
                  onClick={() => setSalt(generateRandomHex(32))}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              </div>
              <input
                type="text"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                className="input-field font-mono text-xs text-slate-400"
              />
            </div>

            {/* Generated Commitment Hash */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 font-mono space-y-1">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3" />
                <span>Computed Commitment Hash (On-Chain Target):</span>
              </div>
              <div className="text-xs text-slate-200 break-all">{previewCommitment}</div>
              <div className="text-[10px] text-slate-500 font-sans pt-1">
                Generated via <code>persistentHash&lt;FinancialSnapshot&gt;(witness)</code>.
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button
              onClick={handleRegisterSnapshot}
              disabled={submittingSnapshot}
              className="btn-purple w-full justify-center !py-3"
            >
              <Cpu className="w-4 h-4" />
              <span>
                {submittingSnapshot
                  ? 'Publishing Commitment to Midnight...'
                  : currentCommitment
                  ? 'Update Registered Snapshot Commitment'
                  : 'Register Financial Snapshot on Midnight'}
              </span>
            </button>
            {currentCommitment && (
              <div className="mt-2 text-center text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Snapshot registered on-chain: {currentCommitment.slice(0, 14)}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: In-Circuit ZK Underwriting & Loan Request (Cols 6) */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 space-y-6 flex flex-col justify-between border-cyan-500/20">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold border border-cyan-500/40">
                  2
                </span>
                <h3 className="text-lg font-bold text-white">Execute ZK Underwriting Circuit</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                requestLoan() Circuit
              </span>
            </div>

            {/* Select Pool */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Lending Pool
              </label>
              <select
                value={selectedPool}
                onChange={(e) => setSelectedPool(e.target.value)}
                className="input-field font-mono text-xs"
              >
                {pools.map((p) => (
                  <option key={p.pool_id} value={p.pool_id}>
                    Pool {p.pool_id.slice(0, 10)}... | Min ${Number(p.min_income).toLocaleString()} | Max DTI{' '}
                    {formatBps(p.max_debt_to_income_bps)} | {formatBps(p.interest_rate_bps)} APR
                  </option>
                ))}
              </select>
            </div>

            {/* Loan Terms Input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Requested Amount (NIGHT)
                </label>
                <input
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  className="input-field font-mono"
                  placeholder="40000"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Collateral to Lock (NIGHT)
                </label>
                <input
                  type="number"
                  value={collateralDeposit}
                  onChange={(e) => setCollateralDeposit(e.target.value)}
                  className="input-field font-mono"
                  placeholder="60000"
                />
                <span className="text-[10px] text-slate-400">Available: {formatNight(userNightBalance)}</span>
              </div>
            </div>

            {/* Real-time In-Circuit Inequality Audit */}
            {activePool && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Real In-Circuit ZK Inequality Audit:</span>
                  <span className={allCriteriaMet ? 'text-emerald-400' : 'text-rose-400'}>
                    {allCriteriaMet ? 'All 3 Inequalities Satisfied' : '1+ Inequalities Unfulfilled'}
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {/* Inequality 1 */}
                  <div
                    className={`p-2.5 rounded-lg flex items-center justify-between border ${
                      incomePasses
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px]">1. Income Floor Constraint</div>
                      <div className="text-[10px] opacity-80">
                        actual_income (${Number(actualIncome).toLocaleString()}) ≥ pool.min_income ($
                        {Number(activePool.min_income).toLocaleString()})
                      </div>
                    </div>
                    <span className="text-sm font-bold">{incomePasses ? 'PASS ✓' : 'FAIL ✗'}</span>
                  </div>

                  {/* Inequality 2 */}
                  <div
                    className={`p-2.5 rounded-lg flex items-center justify-between border ${
                      dtiPasses
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px]">2. DTI Ceiling Constraint</div>
                      <div className="text-[10px] opacity-80">
                        computed_dti ({formatBps(computedDtiBps)}) ≤ pool.max_dti ({formatBps(activePool.max_debt_to_income_bps)})
                      </div>
                    </div>
                    <span className="text-sm font-bold">{dtiPasses ? 'PASS ✓' : 'FAIL ✗'}</span>
                  </div>

                  {/* Inequality 3 */}
                  <div
                    className={`p-2.5 rounded-lg flex items-center justify-between border ${
                      crPasses
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px]">3. Min Collateral Ratio Constraint</div>
                      <div className="text-[10px] opacity-80">
                        collateral_ratio ({formatBps(computedCrBps)}) ≥ pool.min_cr ({formatBps(activePool.min_collateral_ratio_bps)})
                      </div>
                    </div>
                    <span className="text-sm font-bold">{crPasses ? 'PASS ✓' : 'FAIL ✗'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Proving Status Visualizer */}
            {provingLoan && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-300 text-xs space-y-2 animate-pulse">
                <div className="flex items-center gap-2 font-bold">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating Midnight Zero-Knowledge Proof...</span>
                </div>
                <div className="font-mono text-[11px] text-cyan-200">{proofStep}</div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button
              onClick={handleRequestLoan}
              disabled={provingLoan || !allCriteriaMet || !currentCommitment}
              className="btn-primary w-full justify-center !py-3.5 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {provingLoan
                  ? 'Generating ZK Proof & Disbursing...'
                  : !currentCommitment
                  ? 'Please Register Snapshot Commitment First (Step 1)'
                  : !allCriteriaMet
                  ? 'Inequalities Not Satisfied (Proof Will Revert)'
                  : `Disburse ${formatNight(BigInt(requestedAmount))} in ZK`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Proof Trace Audit Inspector if available */}
      {lastProofTrace && (
        <div className="glass-panel p-6 sm:p-8 space-y-4 border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                ZK Proof Generated & Verified Successfully On-Chain!
              </h3>
            </div>
            <span className="badge badge-active text-[10px]">Proof Verified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Circuit:</span>
              <span className="text-cyan-300 font-bold">{lastProofTrace.circuit_name}()</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 truncate">
              <span className="text-slate-500 block text-[10px]">Witness Commitment:</span>
              <span className="text-purple-300">{lastProofTrace.witness_commitment.slice(0, 18)}...</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 truncate">
              <span className="text-slate-500 block text-[10px]">Prover Key:</span>
              <span className="text-slate-300">{lastProofTrace.prover_key}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
