import React from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  Coins, 
  Globe, 
  Lock, 
  Layers 
} from 'lucide-react';
import type { DiscoveredWallet } from '../services/laceWallet';
import { formatNight } from '../contracts/horizonSimulator';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletId?: string) => Promise<void>;
  isConnecting: boolean;
  errorMessage: string | null;
  discoveredWallets: DiscoveredWallet[];
  onCheckDetection: () => void;
  connectedAddress: string | null;
  shieldedAddress?: string;
  dustBalance?: bigint;
  dustCap?: bigint;
  networkId?: string;
  indexerUri?: string;
  selectedNetwork: string;
  onSelectNetwork: (network: string) => void;
  onDisconnect: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
  errorMessage,
  discoveredWallets,
  onCheckDetection,
  connectedAddress,
  shieldedAddress,
  dustBalance,
  dustCap,
  networkId,
  indexerUri,
  selectedNetwork,
  onSelectNetwork,
  onDisconnect,
}) => {
  if (!isOpen) return null;

  const hasWallets = discoveredWallets.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0e141a] border border-white/10 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-inner">
            {connectedAddress ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <Layers className="w-6 h-6 text-cyan-400" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-xl font-normal text-white">
              {connectedAddress ? 'Midnight Wallet Connected' : 'Midnight Lace Wallet Integration'}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Official Midnight DApp Connector Protocol (CAIP-372)
            </p>
          </div>
        </div>

        {/* Connected State */}
        {connectedAddress ? (
          <div className="space-y-4">
            {/* Unshielded Address */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Unshielded Bech32m Address</span>
                <span className="text-emerald-400 font-mono text-[11px]">● ACTIVE</span>
              </div>
              <div className="font-mono text-xs text-slate-200 break-all select-all bg-black/30 p-2.5 rounded-lg border border-white/5">
                {connectedAddress}
              </div>
            </div>

            {/* Shielded Address if available */}
            {shieldedAddress && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Shielded Coin Address (Private State)</span>
                </div>
                <div className="font-mono text-xs text-purple-300 break-all select-all bg-black/30 p-2.5 rounded-lg border border-white/5">
                  {shieldedAddress}
                </div>
              </div>
            )}

            {/* Network & Dust Balances */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Network</span>
                </div>
                <div className="font-mono font-semibold text-cyan-300">
                  {networkId || 'Midnight Testnet'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-slate-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>tDUST Gas Balance</span>
                </div>
                <div className="font-mono font-semibold text-amber-300">
                  {dustBalance !== undefined ? `${dustBalance.toString()} DUST` : 'Available'}
                </div>
              </div>
            </div>

            {indexerUri && (
              <div className="text-[11px] font-mono text-slate-400 truncate">
                Indexer: {indexerUri}
              </div>
            )}

            <button
              onClick={onDisconnect}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition mt-2"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          /* Disconnected State */
          <div className="space-y-4">
            {hasWallets ? (
              <div className="space-y-3">
                {/* Network Selector */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Midnight Target Network</span>
                    <span className="text-cyan-400 font-mono font-semibold uppercase">{selectedNetwork} (active)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['preview', 'preprod', 'undeployed', 'mainnet'] as const).map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => onSelectNetwork(net)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all border text-center ${
                          selectedNetwork === net
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold shadow-sm'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-medium pt-1">
                  Detected Midnight DApp Connector Wallets in <code className="text-cyan-300 font-mono">window.midnight</code>:
                </div>

                {discoveredWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 font-mono text-xs">
                        {wallet.icon ? (
                          <img src={wallet.icon} alt={wallet.name} className="w-6 h-6 rounded" />
                        ) : (
                          'L'
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{wallet.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          API v{wallet.apiVersion} • {wallet.rdns}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onConnect(wallet.id)}
                      disabled={isConnecting}
                      className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-medium transition active:scale-95 disabled:opacity-50"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect →'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 space-y-2">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>No Midnight Wallets Injected</span>
                  </div>
                  <p className="leading-relaxed">
                    Horizon uses the standardized <strong className="text-white">@midnight-ntwrk/dapp-connector-api</strong> to discover and connect with Midnight Lace.
                  </p>
                  <p className="leading-relaxed text-slate-300">
                    No active wallet was found on <code className="text-cyan-300 font-mono">window.midnight</code>. Please ensure the official Midnight Lace Wallet extension is installed and enabled for this page.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono pt-1">
                    Strict Policy: Zero fallback or placeholder addresses are permitted.
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href="https://docs.midnight.network/develop/tutorial/building/prereqs#install-lace"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Lace Setup Guide</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={onCheckDetection}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Re-scan window.midnight"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-scan</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 leading-relaxed font-mono">
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
