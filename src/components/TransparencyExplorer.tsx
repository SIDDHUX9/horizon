import React, { useState, useEffect } from 'react';
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
  Server,
  Rocket,
  Cpu,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExplorerTransaction, Loan, LendingPool, RepaymentEvent, LoanStatus } from '../types/horizon';
import { formatNight, formatBps } from '../contracts/horizonSimulator';
import { LaceConnectedSession } from '../services/laceWallet';
import { HorizonDeployer, DeploymentRecord, DeployStep } from '../services/horizonDeployer';
import { RuntimeMode } from '../services/runtimeMode';

interface TransparencyExplorerProps {
  transactions: ExplorerTransaction[];
  blockHeight: number;
  loans: Loan[];
  pools: LendingPool[];
  repayments: RepaymentEvent[];
  laceSession?: LaceConnectedSession | null;
  onOpenWalletModal?: () => void;
  runtimeMode: RuntimeMode;
}

export const TransparencyExplorer: React.FC<TransparencyExplorerProps> = ({
  transactions,
  blockHeight,
  loans,
  pools,
  repayments,
  laceSession,
  onOpenWalletModal,
  runtimeMode,
}) => {
  const [filterCircuit, setFilterCircuit] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Deployment record from the dev API, falling back to the canonical record.
  const [deployedContract, setDeployedContract] = useState<DeploymentRecord | null>(null);
  const [proofServerOnline, setProofServerOnline] = useState<boolean>(false);
  const [deployModalOpen, setDeployModalOpen] = useState<boolean>(false);
  const [deployStep, setDeployStep] = useState<DeployStep>('idle');
  const [deployMessage, setDeployMessage] = useState<string>('');
  const [deployError, setDeployError] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const showDevDeployment = runtimeMode === 'demo' && import.meta.env.DEV;

  useEffect(() => {
    const checkServer = async () => {
      const status = await HorizonDeployer.checkStatus();
      setProofServerOnline(status.proofServerOnline);
      if (status.deployedContract) {
        setDeployedContract(status.deployedContract);
      }
    };
    checkServer();
  }, []);

  const handleStartDeployment = async () => {
    if (!showDevDeployment) {
      setDeployError('Deployment tooling is unavailable in production builds.');
      return;
    }
    if (!laceSession) {
      if (onOpenWalletModal) {
        onOpenWalletModal();
      }
      return;
    }

    setDeployModalOpen(true);
    setIsDeploying(true);
    setDeployError(null);
    setDeployStep('preparing_proof');
    setDeployMessage('Preparing a locally proven deployment transaction on the configured proof server...');

    try {
      const record = await HorizonDeployer.executeOnChainDeployment(laceSession, (step, msg) => {
        setDeployStep(step);
        setDeployMessage(msg);
      });
      setDeployedContract(record);
      setDeployStep('finalized');
      setIsDeploying(false);
      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      setDeployStep('failed');
      setIsDeploying(false);
      setDeployError(err?.message || 'Deployment encountered an error.');
    }
  };


  const loanList = Array.isArray(loans) ? loans : [];
  const poolList = Array.isArray(pools) ? pools : [];
  const txList = Array.isArray(transactions) ? transactions : [];
  const repaymentList = Array.isArray(repayments) ? repayments : [];

  // Selected loan for live Dual-Ledger side-by-side state inspection
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    loanList.length > 0 ? loanList[0]?.loan_id || '' : ''
  );

  const activeLoan = loanList.find((l) => l && l.loan_id === selectedLoanId) || loanList[0] || null;
  const associatedPool = activeLoan ? poolList.find((p) => p && p.pool_id === activeLoan.pool_id) || poolList[0] || null : null;
  const loanRepayments = activeLoan ? repaymentList.filter((r) => r && r.loan_id === activeLoan.loan_id) : [];

  const filteredTx = txList.filter((tx) => {
    if (!tx || typeof tx !== 'object') return false;
    const matchesCircuit = filterCircuit === 'ALL' || tx.circuit === filterCircuit;
    const txHash = String(tx.tx_hash || '');
    const circuit = String(tx.circuit || '');
    const caller = String(tx.caller || '');
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      txHash.toLowerCase().includes(q) ||
      circuit.toLowerCase().includes(q) ||
      caller.toLowerCase().includes(q);
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
            This explorer combines <strong>live block height</strong> from the Midnight Preview indexer with <strong>local demo ledger records</strong>. No verified Horizon contract deployment exists yet, so protocol rows below are simulations rather than on-chain state.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono relative z-10">
          <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#e2e2dc] shadow-sm flex items-center gap-2">
            <span className="text-[#525f6c] font-sans font-medium">Live Midnight Block:</span>
            <span className="text-emerald-700 font-bold">{blockHeight ? `#${blockHeight}` : 'Unavailable'}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#e2e2dc] shadow-sm flex items-center gap-2">
            <span className="text-[#525f6c] font-sans font-medium">Total Transactions:</span>
            <span className="text-[#11161a] font-bold">{txList.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#e2e2dc] shadow-sm flex items-center gap-2">
            <span className="text-[#525f6c] font-sans font-medium">Active Protocol Loans:</span>
            <span className="text-[#553c9a] font-bold">{loanList.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#e2e2dc] shadow-sm flex items-center gap-2">
            <span className="text-[#525f6c] font-sans font-medium">Proof Server:</span>
            <span className={`font-bold flex items-center gap-1.5 font-sans ${proofServerOnline ? 'text-emerald-700' : 'text-[#525f6c]'}`}>
              <span className={`w-2 h-2 rounded-full ${proofServerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {proofServerOnline ? 'ONLINE (PORT 6300)' : 'STANDBY / LOCAL'}
            </span>
          </div>
          {laceSession && (
            <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#e2e2dc] shadow-sm flex items-center gap-2">
              <span className="text-[#525f6c] font-sans font-medium">Lace tDUST Gas:</span>
              <span className="text-[#11161a] font-bold font-mono">
                {laceSession.dustBalance !== undefined ? (Number(laceSession.dustBalance) / 1000000).toLocaleString() + ' tDUST' : 'Unavailable'}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#e2e2dc] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs font-mono relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold border ${
                deployedContract?.verifiedOnChain
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${deployedContract?.verifiedOnChain ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
                {deployedContract?.verifiedOnChain ? 'VERIFIED ON-CHAIN' : 'NOT DEPLOYED'}
              </span>
              <span className="text-[#707e8c] font-sans">Contract:</span>
            </div>
            <span className="text-[#11161a] font-bold break-all font-mono">
              {deployedContract?.contractAddress || 'None'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {deployedContract?.contractAddress && (
              <a
                href={`https://preview.midnightexplorer.com/contracts/${deployedContract.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#11161a] hover:opacity-75 font-sans font-semibold transition underline shrink-0 py-1.5"
              >
                <span>Verify on Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {showDevDeployment && (
              <button
                onClick={handleStartDeployment}
                disabled={isDeploying}
                className="px-4 py-2 rounded-xl bg-[#11161a] hover:bg-black text-white font-sans text-xs font-bold inline-flex items-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Deploying to Testnet...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-3.5 h-3.5 text-amber-300" />
                    <span>Prepare Deployment (Dev Only)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Modal: Dev-only deployment preparation and verification */}
        {deployModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-[#eaeae5] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#525f6c]">
                    <Rocket className="w-4 h-4 text-amber-500" />
                    <span>Midnight Preview Testnet</span>
                  </div>
                  <h3 className="text-xl font-black text-[#11161a] tracking-tight">
                    Deploy Horizon Compact Contract
                  </h3>
                  <p className="text-xs text-[#525f6c]">
                    Uses the committed circuit artifacts, prepares a locally proven transaction, requests wallet signing, then checks the live indexer before recording anything.
                  </p>
                </div>
                {!isDeploying && (
                  <button
                    onClick={() => setDeployModalOpen(false)}
                    className="p-1 rounded-lg text-[#707e8c] hover:text-[#11161a] hover:bg-[#f5f5f0] transition text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Progress Stepper */}
              <div className="space-y-3 font-mono text-xs">
                {/* Step 1: Circuit Verifiers */}
                <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="font-sans font-bold text-[#11161a]">1. Compile 5 Circuit Verifiers</div>
                    <div className="text-[11px] text-[#707e8c] font-sans">
                      createLendingPool, submitFinancialSnapshot, requestLoan, repayLoan, liquidate
                    </div>
                  </div>
                </div>

                {/* Step 2: Proof Generation */}
                <div className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${
                  deployStep === 'preparing_proof' ? 'bg-amber-50/50 border-amber-300' :
                  deployStep === 'awaiting_lace' || deployStep === 'submitting' || deployStep === 'confirming_block' || deployStep === 'finalized' ? 'bg-[#f8f8f6] border-[#eaeae5]' : 'bg-[#fbfbf9] border-[#eaeae5]'
                }`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    {deployStep === 'preparing_proof' ? (
                      <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                    ) : deployStep === 'awaiting_lace' || deployStep === 'submitting' || deployStep === 'confirming_block' || deployStep === 'finalized' ? (
                      <span className="text-emerald-800">✓</span>
                    ) : (
                      <span className="text-[#707e8c]">2</span>
                    )}
                  </div>
                  <div>
                    <div className="font-sans font-bold text-[#11161a]">2. Local Deployment Proof</div>
                    <div className="text-[11px] text-[#707e8c] font-sans">
                      Proving the deployment payload through the configured proof server; this is not a Horizon circuit call.
                    </div>
                  </div>
                </div>

                {/* Step 3: Lace Authorization */}
                <div className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${
                  deployStep === 'awaiting_lace' ? 'bg-amber-50/50 border-amber-300' :
                  deployStep === 'submitting' || deployStep === 'confirming_block' || deployStep === 'finalized' ? 'bg-[#f8f8f6] border-[#eaeae5]' : 'bg-[#fbfbf9] border-[#eaeae5]'
                }`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    {deployStep === 'awaiting_lace' ? (
                      <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                    ) : deployStep === 'submitting' || deployStep === 'confirming_block' || deployStep === 'finalized' ? (
                      <span className="text-emerald-800">✓</span>
                    ) : (
                      <span className="text-[#707e8c]">3</span>
                    )}
                  </div>
                  <div>
                    <div className="font-sans font-bold text-[#11161a]">3. Midnight Lace Gas Balancing & Signature</div>
                    <div className="text-[11px] text-[#707e8c] font-sans">
                      Please approve the authorization popup in Midnight Lace to spend tDUST gas fees
                    </div>
                  </div>
                </div>

                {/* Step 4: Submission & Confirmation */}
                <div className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${
                  deployStep === 'submitting' || deployStep === 'confirming_block' ? 'bg-amber-50/50 border-amber-300' :
                  deployStep === 'finalized' ? 'bg-[#f8f8f6] border-[#eaeae5]' : 'bg-[#fbfbf9] border-[#eaeae5]'
                }`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    {deployStep === 'submitting' || deployStep === 'confirming_block' ? (
                      <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                    ) : deployStep === 'finalized' ? (
                      <span className="text-emerald-800">✓</span>
                    ) : (
                      <span className="text-[#707e8c]">4</span>
                    )}
                  </div>
                  <div>
                    <div className="font-sans font-bold text-[#11161a]">4. Broadcast to Midnight Preview Node</div>
                    <div className="text-[11px] text-[#707e8c] font-sans">
                      Submitting balanced transaction into Substrate mempool and awaiting block inclusion
                    </div>
                  </div>
                </div>
              </div>

              {/* Status or Error Message */}
              {deployMessage && (
                <div className={`p-4 rounded-2xl text-xs font-mono flex items-center gap-2.5 ${
                  deployStep === 'finalized' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-sans font-medium' :
                  deployStep === 'failed' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                  'bg-[#f8f8f6] text-[#525f6c] border border-[#eaeae5]'
                }`}>
                  {deployStep === 'finalized' ? (
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : deployStep === 'failed' ? (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-[#11161a] animate-spin shrink-0" />
                  )}
                  <span>{deployMessage}</span>
                </div>
              )}

              {deployError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans">
                  <strong>Deployment Error:</strong> {deployError}
                </div>
              )}

              {/* Success Footer */}
              {deployStep === 'finalized' && deployedContract && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="text-xs font-bold text-emerald-900 font-sans flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>Deployment Verified on Indexer</span>
                  </div>
                  <div className="text-xs font-mono break-all text-emerald-950 bg-white/80 p-3 rounded-xl border border-emerald-200">
                    <span className="text-[#707e8c] block text-[10px] font-sans">Contract Address:</span>
                    {deployedContract.contractAddress}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={`https://preview.midnightexplorer.com/contracts/${deployedContract.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-sans text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span>View on Midnight Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setDeployModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-sans text-xs font-bold transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CORE FEATURE: Side-by-Side Dual-Ledger State Inspector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#11161a] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#11161a]" />
              <span>Demo Ledger Audit: Public vs Private</span>
            </h3>
            <p className="text-xs text-[#525f6c]">
              Side-by-side view of simulated protocol state. No verified Horizon contract deployment exists yet.
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
                        Demo Public Ledger State
                      </h4>
                      <p className="text-[11px] text-[#525f6c]">Simulated pool, loan, and repayment accounting stored in this browser.</p>
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
                    <span className="text-[#707e8c] font-sans">Loan ID (Demo Key):</span>
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
                      <div className="text-[11px] text-[#707e8c] font-sans italic">No simulated repayments recorded yet.</div>
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
                    <span className="text-[#707e8c] block text-[10px] font-sans font-medium uppercase tracking-wider">Demo Snapshot Commitment (SHA-256 Digest)</span>
                    <span className="text-[#553c9a] break-all text-[11px] font-bold">{activeLoan.snapshot_commitment}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#eaeae5] text-[11px] text-[#525f6c] flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>These fields are visible in the demo ledger. They are not on-chain and are not yet consensus-verified.</span>
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
                      <p className="text-[11px] text-[#707e8c]">In the demo these values stay in browser state and are not submitted.</p>
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
                      Demo inequality check: <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">actual_income ≥ min_income (${Number(associatedPool?.min_income || 50000).toLocaleString()})</code> evaluated locally without publishing the borrower's exact salary.
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
                      Demo inequality check: <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">computed_dti ≤ max_dti ({formatBps(associatedPool?.max_debt_to_income_bps || 4000)})</code> ceiling evaluated locally.
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
                <span>Demo privacy: raw values stay in browser state; no zero-knowledge proof is generated yet.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#eaeae5] rounded-3xl p-10 text-center text-[#707e8c] text-xs shadow-sm">
            No active loans found in the demo ledger. Create a pool and request a loan in the Borrower Studio.
          </div>
        )}
      </div>

      {/* Full Transaction Stream Explorer */}
      <div className="space-y-4 pt-6 border-t border-[#eaeae5]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#11161a] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#11161a]" />
              <span>Local Transaction Stream ({filteredTx.length})</span>
            </h3>
            <p className="text-xs text-[#525f6c]">Simulated protocol events plus any indexer-confirmed deployment records.</p>
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
                    {tx.onchain_confirmed ? (
                      <a
                        href={`https://preview.midnightexplorer.com/blocks/${tx.block_height}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                        title="Inspect block on Midnight Preview Explorer"
                      >
                        Block #{tx.block_height}
                      </a>
                    ) : (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                        title="Generated by the browser demo; no cryptographic proof was created"
                      >
                        Simulated Transaction
                      </span>
                    )}
                    <span className="text-[#11161a] font-bold">Circuit: {tx.circuit}()</span>
                  </div>
                  <div className="text-[#525f6c] text-[11px]">
                    {tx.onchain_confirmed ? (
                      <a
                        href={tx.explorer_url || `https://preview.midnightexplorer.com/transactions/${tx.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-800 hover:opacity-75 font-mono transition group"
                        title="Inspect an indexer-confirmed transaction on Midnight Preview Explorer"
                      >
                        <span>IndexedTx: <span className="font-semibold underline">{tx.tx_hash.slice(0, 14)}...{tx.tx_hash.slice(-8)}</span></span>
                        <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                      </a>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 text-[#525f6c] font-mono"
                        title="Local demo transaction digest; not a ZK proof"
                      >
                        <span>Demo Digest: <span className="font-semibold text-[#11161a]">{tx.tx_hash.slice(0, 14)}...{tx.tx_hash.slice(-8)}</span></span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Side-by-Side Audit for this Tx */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visible Column */}
                  <div className="p-4 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] space-y-2">
                    <div className="flex items-center gap-2 text-[#11161a] text-xs font-bold uppercase tracking-wider font-sans">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{tx.onchain_confirmed ? 'Public On-Chain Record' : 'Demo Public Record'}</span>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      {Object.entries(tx.public_data || {}).map(([k, v]) => (
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
                      <span>{tx.proof_verified ? 'Shielded Witness' : 'Demo Private Values'}</span>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      {Object.entries(tx.hidden_private_data || {}).map(([k, v]) => (
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
                  {tx.proof_verified && tx.onchain_confirmed ? (
                    <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-sans font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Indexer-confirmed on-chain transaction</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-800 text-[11px] font-sans font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Local simulation — no cryptographic proof generated</span>
                    </div>
                  )}
                  <div className="text-[10px] text-[#707e8c]">
                    {new Date(tx.timestamp).toLocaleTimeString()} • {tx.onchain_confirmed ? 'Indexer-confirmed' : 'Demo event'}
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
