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
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-[#eaeae5] rounded-3xl max-w-lg w-full p-6 sm:p-8 text-[#11161a] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#707e8c] hover:text-[#11161a] hover:bg-[#f5f5f0] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] flex items-center justify-center text-[#11161a] shadow-xs">
            {connectedAddress ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <Layers className="w-6 h-6 text-[#11161a]" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-xl font-normal text-[#11161a]">
              {connectedAddress ? 'Midnight Wallet Connected' : 'Connect Midnight Wallet'}
            </h3>
            <p className="text-xs text-[#525f6c] font-sans">
              Official Midnight DApp Connector Protocol (CAIP-372)
            </p>
          </div>
        </div>

        {/* Connected State */}
        {connectedAddress ? (
          <div className="space-y-4">
            {/* Unshielded Address */}
            <div className="p-4 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#525f6c]">
                <span>Unshielded Bech32m Address</span>
                <span className="text-emerald-700 font-mono text-[11px] font-bold">● ACTIVE</span>
              </div>
              <div className="font-mono text-xs text-[#11161a] font-bold break-all select-all bg-white p-3 rounded-xl border border-[#eaeae5]">
                {connectedAddress}
              </div>
            </div>

            {/* Shielded Address if available */}
            {shieldedAddress && (
              <div className="p-4 rounded-2xl bg-[#fcfbfe] border border-[#e5dff7] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-[#553c9a] font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Shielded Coin Address (Private State)</span>
                </div>
                <div className="font-mono text-xs text-[#553c9a] font-bold break-all select-all bg-white p-3 rounded-xl border border-[#e5dff7]">
                  {shieldedAddress}
                </div>
              </div>
            )}

            {/* Network & Dust Balances */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] space-y-1">
                <div className="text-[#707e8c] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#11161a]" />
                  <span>Network</span>
                </div>
                <div className="font-mono font-bold text-[#11161a]">
                  {networkId || 'Midnight Preview'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] space-y-1">
                <div className="text-[#707e8c] flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>tDUST Gas Balance</span>
                </div>
                <div className="font-mono font-bold text-[#11161a]">
                  {dustBalance !== undefined ? `${dustBalance.toString()} DUST` : 'Available'}
                </div>
              </div>
            </div>

            {indexerUri && (
              <div className="text-[11px] font-mono text-[#707e8c] truncate p-2">
                Indexer: {indexerUri}
              </div>
            )}

            <button
              onClick={onDisconnect}
              className="w-full py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold transition mt-2"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          /* Disconnected State */
          <div className="space-y-4">
            {/* Network Selector */}
            <div className="p-4 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#525f6c]">
                <span>Midnight Target Network</span>
                <span className="text-[#11161a] font-mono font-semibold uppercase">{selectedNetwork} (active)</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['preview', 'preprod', 'undeployed', 'mainnet'] as const).map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => onSelectNetwork(net)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-mono transition-all border text-center ${
                      selectedNetwork === net
                        ? 'bg-[#11161a] border-[#11161a] text-white font-bold shadow-xs'
                        : 'bg-white border-[#d5d5cf] text-[#525f6c] hover:text-[#11161a] hover:bg-[#f5f5f0]'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            {/* Detected Injected Browser Wallets (Lace) */}
            {hasWallets ? (
              <div className="space-y-2.5 pt-2">
                <div className="text-xs text-[#525f6c] font-medium">
                  Detected Midnight DApp Connector Wallets (<code className="text-[#11161a] font-mono font-semibold">window.midnight</code>):
                </div>

                {discoveredWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="p-4 rounded-2xl bg-white border border-[#eaeae5] hover:border-[#11161a] transition flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#f8f8f6] border border-[#eaeae5] flex items-center justify-center font-bold text-[#11161a] font-mono text-xs">
                        {wallet.icon ? (
                          <img src={wallet.icon} alt={wallet.name} className="w-6 h-6 rounded" />
                        ) : (
                          'L'
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#11161a]">{wallet.name}</div>
                        <div className="text-[10px] text-[#707e8c] font-mono">
                          API v{wallet.apiVersion} • {wallet.rdns}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onConnect(wallet.id)}
                      disabled={isConnecting}
                      className="px-5 py-2 rounded-full bg-[#11161a] hover:bg-black text-white text-xs font-semibold transition active:scale-95 disabled:opacity-50 shadow-xs"
                    >
                      {isConnecting ? 'Connecting / Unlock Lace...' : 'Connect Lace →'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#f8f8f6] border border-[#eaeae5] text-xs text-[#525f6c] space-y-2">
                <div className="font-semibold text-[#11161a] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#707e8c]" />
                  <span>Browser Extension Detection</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Install the Midnight Lace Extension in Chrome/Brave/Edge to connect your real on-chain Midnight account.
                </p>
                <div className="flex gap-2 pt-1">
                  <a
                    href="https://docs.midnight.network/develop/tutorial/building/prereqs#install-lace"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 rounded-full border border-[#d5d5cf] bg-white hover:bg-[#f5f5f0] text-[#11161a] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <span>Lace Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={onCheckDetection}
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-[#f5f5f0] border border-[#d5d5cf] text-[#525f6c] hover:text-[#11161a] text-[11px] font-semibold flex items-center gap-1 transition shadow-xs"
                    title="Re-scan window.midnight"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-scan</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed font-sans flex items-start gap-3 shadow-xs">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-amber-950">{errorMessage}</div>
                  {errorMessage.toLowerCase().includes('locked') && (
                    <div className="text-[11px] text-amber-800">
                      Click the Midnight Lace extension icon in your browser toolbar, enter your password to unlock it, then click <strong>Connect Lace →</strong>.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
