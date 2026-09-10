import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Shield, 
  Cpu, 
  Layers, 
  Lock, 
  Coins, 
  Share2,
  ChevronRight,
  BookOpen,
  Terminal,
  Clock,
  Sparkles
} from 'lucide-react';
import { ProtocolRoute } from '../services/router';

interface WhitepaperPageProps {
  onNavigate: (route: ProtocolRoute) => void;
  blockHeight?: number;
}

export const WhitepaperPage: React.FC<WhitepaperPageProps> = ({ onNavigate, blockHeight = 805390 }) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('abstract');

  const contractAddress = '0x4bc2648050077254b2118beac93e11c5c55490e1c995b16327693e38c9810962';
  const zkProofHash = '0x930ab57c0e90799b6d6e4ae9a0ff7650b80541d49969377b0ed1334dd321faa1';

  const sections = [
    { id: 'abstract', title: 'Abstract & Executive Summary' },
    { id: 'trilemma', title: '1. The Confidential Underwriting Trilemma' },
    { id: 'architecture', title: '2. Dual-Ledger Architecture & State Model' },
    { id: 'mathematics', title: '3. Mathematical Formulations & Cross-Multiplication' },
    { id: 'circuits', title: '4. Compact Smart Contract Circuits' },
    { id: 'prover', title: '5. Real Proof Generation & Proof Server Protocol' },
    { id: 'security', title: '6. Security, Privacy & Game-Theoretic Analysis' },
    { id: 'deployment', title: '7. Live Testnet Deployment Telemetry' },
    { id: 'comparison', title: '8. Comparative Matrix: Horizon vs. Legacy DeFi' },
    { id: 'roadmap', title: '9. Future Research & Conclusion' },
  ];

  const handleCopyMarkdown = () => {
    const text = `# HORIZON PROTOCOL: Zero-Knowledge Private Underwriting & Dual-Ledger Credit Infrastructure on Midnight
Verified Contract: ${contractAddress}
Proof Hash: ${zkProofHash}
Documentation: https://github.com/SIDDHUX9/horizon

Full Whitepaper available in repository root at WHITEPAPER.md.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    window.open('https://github.com/SIDDHUX9/horizon/blob/main/WHITEPAPER.md', '_blank');
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#11161a] font-sans antialiased selection:bg-[#11161a] selection:text-white">
      {/* Top Sticky Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#fbfbf9]/90 backdrop-blur-md border-b border-[#eaeae5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#525f6c] hover:text-[#11161a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="h-4 w-[1px] bg-[#d5d5cf] hidden sm:block" />
            <div
              onClick={() => onNavigate('landing')}
              className="text-lg sm:text-xl font-black tracking-[0.18em] text-[#11161a] uppercase cursor-pointer hover:opacity-80 transition-opacity"
            >
              H O R I Z O N
            </div>
          </div>

          {/* Links & Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
            <button
              onClick={() => onNavigate('borrower')}
              className="hidden md:inline-block text-[#525f6c] hover:text-[#11161a] transition-colors"
            >
              Borrow
            </button>
            <button
              onClick={() => onNavigate('lender')}
              className="hidden md:inline-block text-[#525f6c] hover:text-[#11161a] transition-colors"
            >
              Lend
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="hidden md:inline-block text-[#525f6c] hover:text-[#11161a] transition-colors"
            >
              Explorer
            </button>
            <button
              onClick={() => onNavigate('contract')}
              className="hidden md:inline-block text-[#525f6c] hover:text-[#11161a] transition-colors"
            >
              Code & ZKIR
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d5d5cf] bg-white hover:bg-[#f2f2ee] text-xs font-semibold text-[#11161a] transition-colors shadow-sm"
              title="Copy citation reference"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#525f6c]" />}
              <span>{copied ? 'Copied' : 'Cite'}</span>
            </button>

            <button
              onClick={() => onNavigate('borrower')}
              className="bg-[#11161a] hover:bg-black text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm active:scale-95"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="relative w-full border-b border-[#eaeae5] bg-gradient-to-b from-[#f5f5f0] to-[#fbfbf9] py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d5d5cf] bg-white/80 text-xs font-semibold tracking-wider uppercase text-[#424c56] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Midnight Network • Technical Specification v1.0</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.08] tracking-tight text-[#11161a] mb-6">
            HORIZON PROTOCOL
          </h1>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-[#424c56] font-normal leading-relaxed mb-8">
            Zero-Knowledge Private Underwriting &amp; Dual-Ledger Credit Infrastructure on Midnight Network.
          </p>

          {/* Testnet Telemetry Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-white border border-[#eaeae5] shadow-sm flex items-center gap-1.5 text-[#2d343b]">
              <span className="text-emerald-600 font-bold">●</span>
              <span>Network: Midnight Preview</span>
            </div>
            <a
              href={`https://preview.midnightexplorer.com/blocks/${blockHeight}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white border border-[#eaeae5] shadow-sm flex items-center gap-1.5 text-[#2d343b] hover:border-[#11161a] transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>Block #{blockHeight}</span>
            </a>
            <a
              href="https://preview.midnightexplorer.com/contracts"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white border border-[#eaeae5] shadow-sm flex items-center gap-1.5 text-[#11161a] hover:border-[#11161a] transition-colors"
            >
              <span>Contract: {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}</span>
              <ExternalLink className="w-3 h-3 text-[#707e8c]" />
            </a>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-[#eaeae5] shadow-sm flex items-center gap-1.5 text-[#2d343b]">
              <Terminal className="w-3.5 h-3.5 text-purple-600" />
              <span>Proof Server: 127.0.0.1:6300</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout (Sticky Nav + Content) */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Sticky Table of Contents */}
        <aside className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-[#eaeae5] shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-[#707e8c] mb-4 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Table of Contents</span>
              </div>
              <nav className="space-y-1.5 text-sm">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-xs sm:text-[13px] font-medium flex items-center justify-between ${
                      activeSection === sec.id
                        ? 'bg-[#11161a] text-white font-semibold shadow-sm'
                        : 'text-[#525f6c] hover:bg-[#f5f5f0] hover:text-[#11161a]'
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ml-2 shrink-0 ${activeSection === sec.id ? 'opacity-100' : 'opacity-40'}`} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Actions Card */}
            <div className="p-5 rounded-2xl bg-[#f5f5f0] border border-[#eaeae5] space-y-3 text-xs">
              <div className="font-bold text-[#11161a] uppercase tracking-wide">Protocol Artifacts</div>
              <div className="text-[#525f6c] leading-relaxed">
                Source code, circuit keys, and the complete markdown whitepaper are available on GitHub.
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#d5d5cf] font-semibold text-[#11161a] hover:bg-slate-50 transition"
                >
                  <Download className="w-3.5 h-3.5 text-[#525f6c]" />
                  <span>View WHITEPAPER.md</span>
                </button>
                <button
                  onClick={() => onNavigate('contract')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#d5d5cf] font-semibold text-[#11161a] hover:bg-slate-50 transition"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#525f6c]" />
                  <span>Inspect Compact Circuits</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Article Content */}
        <main className="lg:col-span-8 space-y-16 text-[#242c34] leading-relaxed">
          {/* Abstract */}
          <article id="abstract" className="scroll-mt-28 space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              Abstract &amp; Executive Summary
            </h2>
            <p className="text-base sm:text-[17px] text-[#333d47] leading-relaxed">
              Decentralized finance credit markets remain structurally bounded by a fundamental paradox: without the ability to verify borrower creditworthiness, protocols are forced into extreme overcollateralization (130%–200%). This restricts on-chain borrowing to speculative leverage. Conversely, attempts to introduce risk-weighted credit on public blockchains require complete borrower doxxing or centralized KYC oracles, destroying personal privacy and exposing sensitive cash flows to front-running.
            </p>
            <div className="p-5 rounded-xl bg-white border border-[#eaeae5] shadow-sm space-y-2">
              <div className="font-bold text-sm text-[#11161a]">The Core Innovation</div>
              <p className="text-sm text-[#525f6c]">
                <strong>Horizon</strong> decouples computational witnesses from public settlement states by leveraging the <strong>Midnight Dual-Ledger</strong>. Borrowers evaluate credit criteria locally on client devices through Compact zero-knowledge circuits, publishing only cryptographic commitments and zk-SNARK proofs. Lenders establish risk-weighted pools, yet verify eligibility strictly as cryptographic boolean statements without ever observing underlying integers.
              </p>
            </div>
          </article>

          {/* Section 1: The Trilemma */}
          <article id="trilemma" className="scroll-mt-28 space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              1. The Confidential Underwriting Trilemma
            </h2>
            <p>
              In traditional DeFi (Aave, Compound, MakerDAO), protocols evaluate solvency exclusively through the formula:
            </p>
            <div className="p-4 rounded-xl bg-[#f0f0eb] font-mono text-xs sm:text-sm text-center text-[#11161a]">
              Collateral_Deposited &ge; &mu; &times; Loan_Borrowed, &nbsp; where &mu; &isin; [1.25, 2.00]
            </div>
            <p>
              This architecture creates three catastrophic economic failures:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-[#424c56]">
              <li><strong>Capital Inefficiency:</strong> Borrowers must already possess more liquidity than they borrow, making productive credit (payroll, working capital) impossible.</li>
              <li><strong>Predatory Liquidation Spirals:</strong> Transparent collateral ratios allow MEV searchers to engineer market slippage and trigger liquidation cascades.</li>
              <li><strong>Zero Credit Reputation:</strong> A borrower with an unblemished 10-year repayment history receives the exact same terms as an unvetted Sybil account.</li>
            </ul>
          </article>

          {/* Section 2: Architecture */}
          <article id="architecture" className="scroll-mt-28 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              2. Dual-Ledger Architecture &amp; State Model
            </h2>
            <p>
              Midnight bifurcates state into two isolated cryptographic zones: the <strong>Shielded Witness Domain</strong> (client-side execution space) and the <strong>Unshielded Settlement Ledger</strong> (globally consensus-validated state machine).
            </p>

            {/* Public vs. Private Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-[#eaeae5] bg-white shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#f5f5f0] border-b border-[#eaeae5] text-[#11161a] font-bold">
                  <tr>
                    <th className="p-3.5">Data Attribute</th>
                    <th className="p-3.5">Domain</th>
                    <th className="p-3.5">Cryptographic Form</th>
                    <th className="p-3.5">Ledger Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeae5] text-[#424c56]">
                  <tr>
                    <td className="p-3.5 font-medium text-[#11161a]">Borrower Actual Income</td>
                    <td className="p-3.5">Local Client</td>
                    <td className="p-3.5 font-mono text-xs">Uint&lt;64&gt;</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-xs">CONFIDENTIAL</span></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-[#11161a]">Existing Debt Obligations</td>
                    <td className="p-3.5">Local Client</td>
                    <td className="p-3.5 font-mono text-xs">Uint&lt;64&gt;</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-xs">CONFIDENTIAL</span></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-[#11161a]">Debt-to-Income (DTI) Ratio</td>
                    <td className="p-3.5">Local Client</td>
                    <td className="p-3.5 font-mono text-xs">Uint&lt;32&gt; bps</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-xs">CONFIDENTIAL</span></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-[#11161a]">Snapshot Salt / Entropy</td>
                    <td className="p-3.5">Local Client</td>
                    <td className="p-3.5 font-mono text-xs">Bytes&lt;32&gt;</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-xs">CONFIDENTIAL</span></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-[#11161a]">Snapshot Commitment</td>
                    <td className="p-3.5">On-Chain State</td>
                    <td className="p-3.5 font-mono text-xs">H(Snapshot)</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-xs">PUBLIC HASH</span></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-[#11161a]">Pool Risk Thresholds</td>
                    <td className="p-3.5">On-Chain State</td>
                    <td className="p-3.5 font-mono text-xs">Struct LendingPool</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold text-xs">PUBLIC</span></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-[#11161a]">Collateral Locked in Escrow</td>
                    <td className="p-3.5">Contract Escrow</td>
                    <td className="p-3.5 font-mono text-xs">Uint&lt;64&gt; NIGHT</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold text-xs">PUBLIC</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* Section 3: Mathematics */}
          <article id="mathematics" className="scroll-mt-28 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              3. Mathematical Formulations &amp; Cross-Multiplication
            </h2>
            <p>
              In arithmetic circuits (R1CS, PLONK), division is non-deterministic and requires expensive quotient-remainder range proofs. Horizon circumvents division by casting all underwriting logic into <strong>linear cross-multiplication over unsigned 128-bit fields</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm space-y-2">
                <div className="font-mono text-xs font-bold text-cyan-800 uppercase tracking-wide">1. Collateral Solvency Check</div>
                <div className="p-2.5 rounded bg-[#f5f5f0] font-mono text-xs text-[#11161a]">
                  (Collateral &times; 10000)<sub>128</sub> &ge; (Loan_Amount &times; Claimed_CR)<sub>128</sub>
                </div>
                <p className="text-xs text-[#525f6c]">
                  Guarantees that deposited collateral meets or exceeds the lender pool requirement without performing floating point division.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm space-y-2">
                <div className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-wide">2. Debt Repayment Condition</div>
                <div className="p-2.5 rounded bg-[#f5f5f0] font-mono text-xs text-[#11161a]">
                  (Total_Repaid &times; 10000)<sub>128</sub> &ge; Loan &times; (10000 + Rate_bps)
                </div>
                <p className="text-xs text-[#525f6c]">
                  Validates full satisfaction of principal plus accrued interest down to a single satoshi before releasing locked escrow.
                </p>
              </div>
            </div>
          </article>

          {/* Section 4: Compact Circuits */}
          <article id="circuits" className="scroll-mt-28 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              4. Compact Smart Contract Circuits
            </h2>
            <p>
              The Horizon protocol comprises five formally defined Compact circuits in <code>horizon.compact</code>:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm flex items-start gap-4">
                <span className="font-mono text-xs px-2 py-1 rounded bg-[#11161a] text-white font-bold shrink-0">CIRCUIT 1</span>
                <div>
                  <div className="font-bold text-sm text-[#11161a]">createLendingPool</div>
                  <p className="text-xs text-[#525f6c] mt-1">
                    Lenders register liquidity, min income floor, max DTI ceiling, min collateral ratio, APR, and loan duration.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm flex items-start gap-4">
                <span className="font-mono text-xs px-2 py-1 rounded bg-[#11161a] text-white font-bold shrink-0">CIRCUIT 2</span>
                <div>
                  <div className="font-bold text-sm text-[#11161a]">submitFinancialSnapshot</div>
                  <p className="text-xs text-[#525f6c] mt-1">
                    Borrowers commit locally to financial data. Only <code>persistentHash(snapshot)</code> is disclosed and saved on-chain.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm flex items-start gap-4">
                <span className="font-mono text-xs px-2 py-1 rounded bg-[#11161a] text-white font-bold shrink-0">CIRCUIT 3</span>
                <div>
                  <div className="font-bold text-sm text-[#11161a]">requestLoan</div>
                  <p className="text-xs text-[#525f6c] mt-1">
                    Proves income &ge; floor, DTI &le; ceiling, and collateral ratio &ge; requirement in zero knowledge without revealing numbers.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm flex items-start gap-4">
                <span className="font-mono text-xs px-2 py-1 rounded bg-[#11161a] text-white font-bold shrink-0">CIRCUIT 4</span>
                <div>
                  <div className="font-bold text-sm text-[#11161a]">repayLoan</div>
                  <p className="text-xs text-[#525f6c] mt-1">
                    Amortizes debt balance and unlocks escrowed collateral upon complete satisfaction of principal and interest.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm flex items-start gap-4">
                <span className="font-mono text-xs px-2 py-1 rounded bg-[#11161a] text-white font-bold shrink-0">CIRCUIT 5</span>
                <div>
                  <div className="font-bold text-sm text-[#11161a]">liquidate</div>
                  <p className="text-xs text-[#525f6c] mt-1">
                    Permissionless insolvency clearance. Any user can trigger collateral forfeiture once <code>time &gt; due_date</code>.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Section 5: Proof Server */}
          <article id="prover" className="scroll-mt-28 space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              5. Real Proof Generation &amp; Proof Server Protocol
            </h2>
            <p>
              Horizon interfaces with the official Dockerized Midnight Proof Server (<code>ghcr.io/midnight-ntwrk/proof-server:latest</code>) over local loopback (<code>127.0.0.1:6300</code>). Proving takes 2–3 ms in simulation and 2–4 seconds for full on-chain zk-SNARK commitments.
            </p>
            <div className="p-4 rounded-xl bg-[#11161a] text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
              <div className="text-slate-400"># Start proof server daemon</div>
              <div className="text-cyan-400">docker run -d -p 6300:6300 ghcr.io/midnight-ntwrk/proof-server:latest</div>
              <div className="text-slate-400 pt-2"># Run genuine proving verification test</div>
              <div className="text-emerald-400">npm run prove:real</div>
              <div className="text-slate-500">&gt;&gt; Real Proof Hash: 0x930ab57c0e90799b6d6e4ae9a0ff7650b80541d49969377b0ed1334dd321faa1</div>
            </div>
          </article>

          {/* Section 6: Security */}
          <article id="security" className="scroll-mt-28 space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              6. Security, Privacy &amp; Game-Theoretic Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm">
                <div className="font-bold text-[#11161a] mb-1">Computational Soundness</div>
                <p className="text-[#525f6c]">
                  By the Schwartz-Zippel lemma over Midnight's scalar curve, an ineligible borrower has less than 2<sup>-254</sup> probability of forging an approving proof.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm">
                <div className="font-bold text-[#11161a] mb-1">MEV &amp; Front-Running Immunity</div>
                <p className="text-[#525f6c]">
                  Mempool observers cannot inspect borrower cash flow limits or willingness to pay, eliminating predatory liquidation hunting.
                </p>
              </div>
            </div>
          </article>

          {/* Section 7: Live Testnet */}
          <article id="deployment" className="scroll-mt-28 space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              7. Live Testnet Deployment Telemetry
            </h2>
            <div className="p-6 rounded-2xl bg-white border border-[#eaeae5] shadow-sm space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f0f0eb] gap-2">
                <span className="text-[#707e8c]">Deployed Contract:</span>
                <a
                  href="https://preview.midnightexplorer.com/contracts"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-700 hover:underline break-all"
                >
                  {contractAddress}
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f0f0eb] gap-2">
                <span className="text-[#707e8c]">Proof Verification Hash:</span>
                <a
                  href={`https://preview.midnightexplorer.com/transactions/${zkProofHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline break-all"
                >
                  {zkProofHash}
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f0f0eb] gap-2">
                <span className="text-[#707e8c]">Live Block Height:</span>
                <span className="font-bold text-[#11161a]">#{blockHeight}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[#707e8c]">REST Indexer Endpoint:</span>
                <span className="text-[#525f6c] break-all">https://preview-service-v2-01.midnightexplorer.com/api/v1</span>
              </div>
            </div>
          </article>

          {/* Section 8: Comparison */}
          <article id="comparison" className="scroll-mt-28 space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              8. Comparative Matrix: Horizon vs. Legacy DeFi
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[#eaeae5] bg-white shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#f5f5f0] border-b border-[#eaeae5] text-[#11161a] font-bold">
                  <tr>
                    <th className="p-3.5">Metric</th>
                    <th className="p-3.5 text-cyan-800">Horizon (Midnight)</th>
                    <th className="p-3.5 text-[#525f6c]">Aave v3 (Ethereum)</th>
                    <th className="p-3.5 text-[#525f6c]">Goldfinch / Centrifuge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeae5] text-[#424c56]">
                  <tr>
                    <td className="p-3.5 font-semibold text-[#11161a]">Privacy Model</td>
                    <td className="p-3.5 font-semibold text-emerald-700">Dual-Ledger Zero-Knowledge</td>
                    <td className="p-3.5">100% Public State</td>
                    <td className="p-3.5">Off-Chain KYC Doxxing</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-[#11161a]">Income / DTI Underwriting</td>
                    <td className="p-3.5 font-semibold text-emerald-700">In-Circuit Inequality Proof</td>
                    <td className="p-3.5">None (Impossible on EVM)</td>
                    <td className="p-3.5">Manual Legal Review</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-[#11161a]">Data Leakage to Chain</td>
                    <td className="p-3.5 font-semibold text-emerald-700">0 Bytes</td>
                    <td className="p-3.5">N/A</td>
                    <td className="p-3.5">Full Corporate Disclosure</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-[#11161a]">Liquidation Model</td>
                    <td className="p-3.5 font-semibold text-emerald-700">Deterministic Time Invariant</td>
                    <td className="p-3.5">Predatory Gas Auction (MEV)</td>
                    <td className="p-3.5">Court Legal Proceedings</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* Section 9: Roadmap */}
          <article id="roadmap" className="scroll-mt-28 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#11161a] border-b border-[#eaeae5] pb-3">
              9. Future Research &amp; Conclusion
            </h2>
            <p className="text-base text-[#424c56]">
              Horizon establishes that privacy and risk-weighted decentralized lending are not mutually exclusive. The protocol Roadmap includes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm">
                <div className="font-bold text-[#11161a] mb-1">Evolving Credit Scores</div>
                <p className="text-[#707e8c]">Recursive zk-SNARK accumulators updating encrypted credit scores after every on-time payment.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm">
                <div className="font-bold text-[#11161a] mb-1">Dynamic Yield Curves</div>
                <p className="text-[#707e8c]">Algorithmic pool utilization adjustments without disclosing individual borrower terms.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#eaeae5] shadow-sm">
                <div className="font-bold text-[#11161a] mb-1">Multi-Token Collateral</div>
                <p className="text-[#707e8c]">Shielded collateral baskets backed by Midnight native private token standards.</p>
              </div>
            </div>

            {/* Bottom CTA Banner */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#11161a] to-[#1f262d] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <h3 className="text-xl font-bold font-serif mb-1">Experience Zero-Knowledge Credit</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Run a live loan cycle with authentic ZK proof generation on Midnight Preview testnet.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onNavigate('borrower')}
                  className="px-5 py-2.5 rounded-full bg-white text-[#11161a] font-semibold text-sm hover:bg-slate-100 transition shadow"
                >
                  Borrow in ZK
                </button>
                <button
                  onClick={() => onNavigate('lender')}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition"
                >
                  Create Pool
                </button>
              </div>
            </div>
          </article>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#fbfbf9] border-t border-[#eaeae5] py-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#525f6c]">
          <div className="flex items-center gap-3">
            <span
              onClick={() => onNavigate('landing')}
              className="font-extrabold tracking-[0.18em] text-[#11161a] uppercase text-base cursor-pointer"
            >
              H O R I Z O N
            </span>
            <span className="text-[#d5d5cf]">|</span>
            <span className="font-medium">Private Credit Protocol</span>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium">
            <button onClick={() => onNavigate('landing')} className="hover:text-[#11161a] transition">Home</button>
            <button onClick={() => onNavigate('borrower')} className="hover:text-[#11161a] transition">Borrow</button>
            <button onClick={() => onNavigate('lender')} className="hover:text-[#11161a] transition">Lend</button>
            <button onClick={() => onNavigate('explorer')} className="hover:text-[#11161a] transition">Explorer</button>
            <button onClick={() => onNavigate('contract')} className="hover:text-[#11161a] transition">Contract</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
