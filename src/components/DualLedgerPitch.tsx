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
      {/* Editorial Hero Section */}
      <div className="relative rounded-3xl p-8 sm:p-12 md:p-14 border border-[#eaeae5] bg-white shadow-sm overflow-hidden">
        {/* Background Theme Banner */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: "url('/app-banner.jpg')", backgroundPosition: 'center 40%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30 pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f8f8f6] border border-[#eaeae5] text-[#525f6c] text-xs font-bold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#11161a]" />
            <span>Built on Midnight Network • Dual-Ledger Architecture</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#11161a] tracking-tight leading-[1.1] mb-6">
            Prove you qualify. <br />
            <span className="italic font-normal text-[#525f6c]">Never reveal your numbers.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#525f6c] leading-relaxed mb-8 max-w-3xl">
            Traditional on-chain lending protocols force excessive overcollateralization because they cannot assess true creditworthiness without public KYC that strips all personal financial privacy.
            <br /><br />
            <strong className="text-[#11161a]">Horizon solves this on Midnight</strong>: borrowers prove in zero-knowledge that their confidential income, debt-to-income (DTI) ratio, and collateral satisfy the lender's risk floor — <span className="text-[#11161a] font-semibold underline decoration-[#eaeae5] decoration-2">without the underlying numbers ever leaving the client</span>.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('borrower')}
              className="bg-[#11161a] hover:bg-black text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-full shadow-sm active:scale-95 transition flex items-center gap-2"
            >
              <span>Borrower Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('lender')}
              className="bg-white hover:bg-[#f5f5f0] border border-[#d5d5cf] text-[#11161a] font-semibold text-sm sm:text-base px-6 py-3 rounded-full shadow-xs active:scale-95 transition flex items-center gap-2"
            >
              <span>Deploy Lending Pool</span>
              <Coins className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="bg-white hover:bg-[#f5f5f0] border border-[#d5d5cf] text-[#525f6c] hover:text-[#11161a] font-semibold text-sm sm:text-base px-6 py-3 rounded-full shadow-xs transition"
            >
              <span>View On-Chain Explorer</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Core Pitch: Public Ledger vs Private State Side-by-Side */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#11161a] tracking-tight">The Midnight Architectural Split</h2>
          <p className="text-sm text-[#525f6c]">
            A cryptographic audit of what is visible on the public explorer vs. what is strictly contained in local ZK witness memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Public Ledger Card */}
          <div className="bg-white border border-[#eaeae5] rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-[#eaeae5] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] text-[#11161a]">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#11161a]">Public Ledger State</h3>
                  <p className="text-xs text-[#707e8c] font-mono">Globally verifiable on-chain (NIGHT Ledger)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Visible to All
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: "Lender's Risk Floor Rules", desc: 'Min income floor ($50k), Max DTI (40%), Min Collateral Ratio (150%)' },
                { label: 'Pool Liquidity (NIGHT)', desc: 'Available capital balance held in protocol escrow' },
                { label: 'Loan Lifecycle Status', desc: 'Immutable enum: ACTIVE, REPAID, DEFAULTED, LIQUIDATED' },
                { label: 'Collateral Locked in Escrow', desc: 'Verifiable NIGHT deposit guaranteeing the loan custody' },
                { label: 'Loan Amount, Rate & Due Date', desc: 'Principal amount, fixed APR basis points, deadline timestamp' },
                { label: 'Repayment Receipts', desc: 'Proof that payment occurred without revealing funding origin' }
              ].map((item, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#11161a]">{item.label}</div>
                    <div className="text-[11px] text-[#525f6c] mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-xs text-[#525f6c] font-mono bg-[#f8f8f6] p-3.5 rounded-2xl border border-[#eaeae5]">
              💡 <strong className="text-[#11161a]">Why it is public:</strong> Solvency, total locked value, and collateral custody must be mathematically provable to every node verifying consensus.
            </div>
          </div>

          {/* Private Witness State Card */}
          <div className="bg-[#fcfbfe] border border-[#e5dff7] rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e5dff7] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white border border-[#e5dff7] text-[#553c9a]">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#553c9a]">Private Witness State</h3>
                  <p className="text-xs text-[#707e8c] font-mono">Client-side ZK Witness only (Never On-Chain)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f0eefc] text-[#553c9a] border border-[#d8d0f5]">
                Zero Knowledge
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: "Borrower's Actual Income", desc: 'Exact annual or monthly salary figure remains strictly confidential' },
                { label: "Borrower's Existing Debt", desc: 'Mortgages, student loans, or credit obligations remain confidential' },
                { label: 'Computed Debt-to-Income (DTI)', desc: 'Inequality proved (DTI <= ceiling) without exposing the ratio' },
                { label: 'Computed Collateral Ratio', desc: 'Ratio proved (CR >= floor) without disclosing actual balance' },
                { label: '256-Bit Secret Blinding Salt', desc: 'Prevents rainbow table or dictionary guessing of financial status' },
                { label: 'Underwriting Rejection Reasons', desc: 'If unfulfilled, proof generation aborts locally without public stigma' }
              ].map((item, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white border border-[#e5dff7] flex items-start gap-3 shadow-xs">
                  <Lock className="w-4 h-4 text-[#553c9a] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#11161a]">{item.label}</div>
                    <div className="text-[11px] text-[#525f6c] mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-xs text-[#553c9a] font-mono bg-[#f0eefc] p-3.5 rounded-2xl border border-[#d8d0f5]">
              🔒 <strong>Why it is private:</strong> Midnight executes the witness function locally in WASM and submits only cryptographic proofs to the consensus ledger.
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Lifecycle Diagram */}
      <div className="bg-white border border-[#eaeae5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#525f6c] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-[#11161a]" />
            <span>Complete Underwriting Lifecycle</span>
          </div>
          <h3 className="text-xl font-bold text-[#11161a]">5-Step End-to-End Workflow</h3>
        </div>

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
              detail: 'Borrower generates ZK proof proving income >= floor and DTI <= ceiling. Contract disburses loan if valid.',
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
            <div key={idx} className="p-5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] relative flex flex-col justify-between">
              <div>
                <div className="text-2xl font-black text-[#d5d5cf] font-mono mb-2">{item.step}</div>
                <h4 className="text-sm font-bold text-[#11161a] mb-1.5">{item.title}</h4>
                <p className="text-xs text-[#525f6c] leading-relaxed mb-4">{item.detail}</p>
              </div>
              <div className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white text-[#11161a] border border-[#eaeae5] truncate font-semibold shadow-xs">
                ⚡ {item.circuit}()
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
