import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Clock, 
  RefreshCw, 
  FastForward, 
  ChevronRight, 
  Coins, 
  ExternalLink,
  Layers,
  FileCode2,
  Lock
} from 'lucide-react';
import { formatNight } from '../contracts/horizonSimulator';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  blockHeight: number;
  walletConnected: boolean;
  userAddress: string | null;
  onOpenWalletModal: () => void;
  onDisconnectWallet: () => void;
  userNightBalance: bigint;
  setUserNightBalance: React.Dispatch<React.SetStateAction<bigint>>;
  onAdvanceTime: (days: number) => void;
  onResetDemo: () => void;
  currentTimeStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  blockHeight,
  walletConnected,
  userAddress,
  onOpenWalletModal,
  onDisconnectWallet,
  userNightBalance,
  setUserNightBalance,
  onAdvanceTime,
  onResetDemo,
  currentTimeStr,
}) => {
  const [faucetLoading, setFaucetLoading] = useState(false);

  const handleFaucet = () => {
    setFaucetLoading(true);
    setTimeout(() => {
      setUserNightBalance((prev) => prev + 50000n);
      setFaucetLoading(false);
    }, 600);
  };

  const navItems = [
    { id: 'landing', label: 'Editorial Home', icon: Layers },
    { id: 'lender', label: 'Lender Hub', icon: Coins },
    { id: 'borrower', label: 'Borrower ZK Studio', icon: Lock },
    { id: 'loans', label: 'Active Loans & Repay', icon: Clock },
    { id: 'liquidate', label: 'Permissionless Liquidation', icon: ShieldCheck },
    { id: 'explorer', label: 'Midnight Explorer', icon: ExternalLink },
    { id: 'contract', label: 'Compact Contract & ZKIR', icon: FileCode2 },
  ];

  return (
    <header className="w-full border-b border-[var(--border-subtle)] bg-[rgba(6,9,17,0.85)] sticky top-0 z-50 backdrop-blur-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between text-xs text-[var(--text-muted)] gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Midnight Testnet (Online)</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-mono">
            <span>Block: #{blockHeight}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Protocol Time: {currentTimeStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAdvanceTime(10)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
            title="Fast forward protocol clock by 10 days to test due date expiration"
          >
            <FastForward className="w-3 h-3 text-amber-400" />
            <span>+10 Days</span>
          </button>
          <button
            onClick={() => onAdvanceTime(35)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
            title="Fast forward protocol clock by 35 days for instant loan default"
          >
            <FastForward className="w-3 h-3 text-rose-400" />
            <span>+35 Days</span>
          </button>
          <button
            onClick={onResetDemo}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
            title="Reset to default protocol demo state"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#070b14] rounded-[10px] flex items-center justify-center">
              <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                H
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">HORIZON</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Midnight ZK
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] hidden sm:block">Private Lending • Proofs Over Disclosure</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#090e1a] p-1 rounded-xl border border-[var(--border-subtle)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Wallet Connector */}
        <div className="flex items-center gap-2.5">
          {walletConnected && userAddress ? (
            <div className="flex items-center gap-2">
              {/* NIGHT Faucet button */}
              <button
                onClick={handleFaucet}
                disabled={faucetLoading}
                className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold items-center gap-1.5 transition"
                title="Get 50,000 Testnet NIGHT tokens from Faucet"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>{faucetLoading ? 'Minting...' : '+50k NIGHT'}</span>
              </button>

              <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-[var(--border-subtle)] flex items-center gap-2 font-mono text-xs">
                <span className="text-cyan-300 font-bold">{formatNight(userNightBalance)}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-slate-400">{`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}</span>
              </div>

              <button
                onClick={onDisconnectWallet}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Disconnect Lace Wallet"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenWalletModal}
              className="btn-primary text-xs !py-2 !px-3.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Lace Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 gap-1 border-t border-[var(--border-subtle)] bg-[#070b14]/90">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
