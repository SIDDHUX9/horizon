import React from 'react';
import { 
  ShieldCheck, 
  EyeOff, 
  Eye, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  Coins, 
  AlertTriangle 
} from 'lucide-react';

interface DualLedgerPitchProps {
  onNavigate: (tab: string) => void;
}

export const DualLedgerPitch: React.FC<DualLedgerPitchProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 border border-[var(--border-subtle)] bg-gradient-to-b from-[#0e1628]/90 via-[#0a0f1d]/90 to-[#070b14]/90 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built on Midnight Network • Dual-Token Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Prove you qualify. <br />
            <span className="text-gradient-cyan">Never reveal your numbers.</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-3xl">
            Traditional on-chain lending (Aave, Compound) forces overcollateralization because protocols cannot assess true creditworthiness without KYC that strips all financial privacy.
            <br /><br />
            <strong className="text-white">Horizon solves this on Midnight</strong>: borrowers prove in zero-knowledge that their confidential income, debt-to-income (DTI) ratio, and collateral satisfy the lender's risk floor — <span className="text-cyan-300 font-semibold">without the numbers ever touching the public chain</span>.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('borrower')}
              className="btn-primary text-sm sm:text-base !py-3 !px-6"
            >
              <span>Borrower ZK Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('lender')}
              className="btn-purple text-sm sm:text-base !py-3 !px-6"
            >
              <span>Deploy Lending Pool</span>
              <Coins className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="btn-secondary text-sm sm:text-base !py-3 !px-6"
            >
              <span>View On-Chain Explorer</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Core Pitch: Public Ledger vs Private State Side-by-Side */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">The Midnight Architectural Split</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            A visual audit of what is visible on the public explorer vs. what is strictly contained in local ZK witness memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Public Ledger Card */}
          <div className="glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Public Ledger State</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">Globally verifiable on-chain (NIGHT Ledger)</p>
                </div>
              </div>
              <span className="badge badge-active text-[10px]">Visible to All</span>
            </div>

            <div className="space-y-3">
              {[
                { label: "Lender's Risk Thresholds", desc: 'Min income floor ($50k), Max DTI (40%), Min Collateral Ratio (150%)' },
                { label: 'Pool Liquidity (NIGHT)', desc: 'Available capital balance held in protocol escrow' },
                { label: 'Loan Lifecycle Status', desc: 'Immutable enum: ACTIVE, REPAID, DEFAULTED, LIQUIDATED' },
                { label: 'Collateral Locked in Escrow', desc: 'Verifiable NIGHT deposit guaranteeing the loan custody' },
                { label: 'Loan Amount, Rate & Due Date', desc: 'Principal amount, fixed APR basis points, deadline timestamp' },
                { label: 'Repayment Receipts', desc: 'Proof that payment occurred without revealing funding source' }
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-xs text-cyan-300/80 font-mono bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20">
              💡 <strong>Why it is public:</strong> Solvency and collateral custody must be mathematically provable to anyone verifying the chain.
            </div>
          </div>

          {/* Private Witness State Card */}
          <div className="glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Private Witness State</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">Client-side ZK Witness only (Never On-Chain)</p>
                </div>
              </div>
              <span className="badge badge-repaid text-[10px] !text-purple-300 !border-purple-500/30 !bg-purple-500/15">
                Zero Knowledge
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: "Borrower's Actual Income", desc: 'Exact annual or monthly salary figure remains confidential' },
                { label: "Borrower's Existing Debt", desc: 'Mortgages, student loans, or credit obligations remain confidential' },
                { label: 'Computed Debt-to-Income (DTI)', desc: 'Inequality proved (DTI <= ceiling) without exposing the ratio' },
                { label: 'Computed Collateral Ratio', desc: 'Ratio proved (CR >= floor) without disclosing actual net worth' },
                { label: '256-Bit Secret Blinding Salt', desc: 'Prevents rainbow table or dictionary guessing of financial status' },
                { label: 'Underwriting Rejection Reasons', desc: 'If unfulfilled, transaction reverts locally without public stigma' }
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-xs text-purple-300/80 font-mono bg-purple-950/20 p-3 rounded-lg border border-purple-500/20">
              🔒 <strong>Why it is private:</strong> Midnight executes the witness function off-chain and passes only cryptographic proofs to the contract.
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Lifecycle Diagram */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Complete 5-Step Underwriting Lifecycle</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Lender Creates Pool',
              detail: 'Lender deposits NIGHT liquidity and establishes public risk rules (min income, max DTI, min collateral ratio).',
              circuit: 'createLendingPool',
            },
            {
              step: '02',
              title: 'Private Snapshot',
              detail: 'Borrower client locally hashes income, debt, and salt into a persistent commitment. Raw data never leaves memory.',
              circuit: 'submitFinancialSnapshot',
            },
            {
              step: '03',
              title: 'In-Circuit ZK Audit',
              detail: 'Borrower client generates ZK proof proving income >= floor and DTI <= ceiling. Contract disburses loan if valid.',
              circuit: 'requestLoan',
            },
            {
              step: '04',
              title: 'Repayment Stream',
              detail: 'Borrower satisfies debt with fixed APR interest. Full repayment unlocks collateral back to borrower.',
              circuit: 'repayLoan',
            },
            {
              step: '05',
              title: 'Liquidation Path',
              detail: 'If due date lapses without repayment, ANY caller can permissionlessly trigger liquidation to reimburse pool.',
              circuit: 'liquidate',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 relative flex flex-col justify-between">
              <div>
                <div className="text-2xl font-black text-cyan-400/30 font-mono mb-1">{item.step}</div>
                <h4 className="text-sm font-bold text-white mb-1.5">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{item.detail}</p>
              </div>
              <div className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/50 truncate">
                ⚡ {item.circuit}()
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
