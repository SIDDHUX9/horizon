import React from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Clock, 
  Coins, 
  ExternalLink,
  Layers,
  FileCode2,
  Lock,
  BookOpen
} from 'lucide-react';
import { formatNight } from '../contracts/horizonSimulator';
import { ProtocolRoute } from '../services/router';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: ProtocolRoute | string) => void;
  blockHeight: number;
  walletConnected: boolean;
  userAddress: string | null;
  onOpenWalletModal: () => void;
  onDisconnectWallet: () => void;
  userNightBalance: bigint;
  setUserNightBalance?: React.Dispatch<React.SetStateAction<bigint>>;
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
  onAdvanceTime,
  onResetDemo,
  currentTimeStr,
}) => {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Layers },
    { id: 'whitepaper', label: 'Whitepaper', icon: BookOpen },
    { id: 'borrower', label: 'Borrow', icon: Lock },
    { id: 'lender', label: 'Lend', icon: Coins },
    { id: 'loans', label: 'Loans', icon: Clock },
    { id: 'liquidate', label: 'Liquidate', icon: ShieldCheck },
    { id: 'explorer', label: 'Explorer', icon: ExternalLink },
    { id: 'contract', label: 'Contract & ZKIR', icon: FileCode2 },
  ];

  return (
    <header className="w-full border-b border-[#eaeae5] bg-[#fbfbf9]/95 sticky top-0 z-50 backdrop-blur-md">
      {/* Top Telemetry & Simulator Control Strip */}
      <div className="border-b border-[#eaeae5] bg-[#f5f5f0]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between text-xs text-[#525f6c] gap-3">
          {/* Left Network Telemetry */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Midnight Preview</span>
            </div>
            <span className="text-[#d5d5cf] hidden sm:inline">•</span>
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[#374151] text-[11px]">
              <span className="text-[#9ca3af]">Block:</span>
              <span className="text-[#11161a] font-semibold">#{blockHeight}</span>
            </div>
            <span className="text-[#d5d5cf] hidden md:inline">•</span>
            <div className="hidden md:flex items-center gap-1.5 font-mono text-[#6b7280] text-[11px]">
              <Clock className="w-3 h-3 text-[#9ca3af]" />
              <span>{currentTimeStr}</span>
            </div>
          </div>

          {/* Right Status */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-[#707e8c] shrink-0">
            <span>Dual-Ledger Protocol</span>
            <span className="text-[#d5d5cf]">•</span>
            <span className="text-emerald-700 font-semibold font-mono">Synced</span>
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
        {/* Logo Branding - strictly non-wrapping */}
        <div 
          className="flex items-center cursor-pointer select-none shrink-0" 
          onClick={() => setActiveTab('landing')}
        >
          <div className="text-xl sm:text-2xl font-black tracking-[0.18em] text-[#11161a] uppercase whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity">
            H O R I Z O N
          </div>
        </div>

        {/* Center Pill Navigation */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#f5f5f0] p-1 rounded-full border border-[#eaeae5] shadow-inner shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#11161a] text-white font-semibold shadow-sm'
                    : 'text-[#525f6c] hover:text-[#11161a] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#6b7280]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Wallet & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {walletConnected && userAddress ? (
            <div className="flex items-center gap-2 shrink-0">
              {/* Wallet Pill with balance and address */}
              <div className="px-3.5 py-1.5 rounded-full bg-white border border-[#d5d5cf] flex items-center gap-2.5 font-mono text-xs shadow-sm shrink-0">
                <span className="text-[#11161a] font-bold">{formatNight(userNightBalance)}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[#6b7280]">{`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}</span>
              </div>

              {/* Disconnect */}
              <button
                onClick={onDisconnectWallet}
                className="p-1.5 rounded-full hover:bg-[#f5f5f0] text-[#6b7280] hover:text-[#11161a] transition shrink-0"
                title="Disconnect Wallet"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenWalletModal}
              className="bg-[#11161a] hover:bg-black text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar for medium screens / tablet scroll */}
      <div className="xl:hidden flex overflow-x-auto px-4 py-2 gap-1 border-t border-[#eaeae5] bg-[#f5f5f0] scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                isActive
                  ? 'bg-[#11161a] text-white font-semibold shadow-sm'
                  : 'text-[#525f6c] hover:text-[#11161a]'
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
