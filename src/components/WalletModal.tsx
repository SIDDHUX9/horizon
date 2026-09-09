import React from 'react';
import { ShieldAlert, ExternalLink, RefreshCw, X, CheckCircle2 } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  errorMessage: string | null;
  laceDetected: boolean;
  onCheckDetection: () => void;
  connectedAddress: string | null;
  onDisconnect: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
  errorMessage,
  laceDetected,
  onCheckDetection,
  connectedAddress,
  onDisconnect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0e141a] border border-white/10 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
            {connectedAddress ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-xl font-normal">
              {connectedAddress ? 'Midnight Wallet Connected' : 'Connect Midnight Lace Wallet'}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Zero-Knowledge Private Lending on Midnight
            </p>
          </div>
        </div>

        {/* Connected State */}
        {connectedAddress ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs text-slate-400">Authenticated Midnight Address</div>
              <div className="font-mono text-xs text-emerald-400 break-all select-all">
                {connectedAddress}
              </div>
            </div>
            <button
              onClick={onDisconnect}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          /* Disconnected State */
          <div className="space-y-4">
            {laceDetected ? (
              /* Lace Detected */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>Midnight Lace extension detected in your browser window.</span>
                </div>

                <button
                  onClick={onConnect}
                  disabled={isConnecting}
                  className="w-full py-3 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-medium transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isConnecting ? 'Waiting for Lace authorization...' : 'Authorize in Lace Wallet →'}
                </button>
              </div>
            ) : (
              /* Lace NOT Detected */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 space-y-2">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Lace Extension Not Detected</span>
                  </div>
                  <p className="leading-relaxed">
                    Horizon operates strictly on Midnight Network. To interact with lending pools and generate zero-knowledge proofs, please install the official Midnight Lace Wallet extension.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Per protocol security standards, no fallback or placeholder addresses are permitted.
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href="https://docs.midnight.network/develop/tutorial/building/prereqs#install-lace"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Install Lace Wallet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={onCheckDetection}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Re-check browser for Lace extension"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message if any */}
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
