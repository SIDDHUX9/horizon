import React from 'react';
import { KeyRound, Lock, X } from 'lucide-react';

interface PrivateStatePasswordModalProps {
  isOpen: boolean;
  password: string;
  onPasswordChange: (password: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  isUnlocking: boolean;
  errorMessage: string | null;
  accountId?: string;
}

/**
 * Requests the password used to encrypt browser-local private state.
 * The value stays in React memory for this session only. It is never logged,
 * persisted, or included in an error message.
 */
export const PrivateStatePasswordModal: React.FC<PrivateStatePasswordModalProps> = ({
  isOpen,
  password,
  onPasswordChange,
  onSubmit,
  onCancel,
  isUnlocking,
  errorMessage,
  accountId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <form
        className="relative w-full max-w-md rounded-3xl border border-[#eaeae5] bg-white p-6 shadow-2xl sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel private state unlock"
          className="absolute right-5 top-5 rounded-full p-2 text-[#707e8c] transition hover:bg-[#f5f5f0] hover:text-[#11161a]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eaeae5] bg-[#f8f8f6]">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl">Unlock private state</h3>
            <p className="text-xs text-[#525f6c]">Required before any circuit call</p>
          </div>
        </div>

        {accountId && (
          <p className="mb-4 truncate rounded-xl border border-[#eaeae5] bg-[#f8f8f6] p-2.5 font-mono text-[11px] text-[#525f6c]">
            Account: {accountId}
          </p>
        )}

        <label className="mb-1.5 block text-xs font-semibold" htmlFor="private-state-password">
          Private state password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            id="private-state-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            disabled={isUnlocking}
            className="w-full rounded-xl border border-[#d5d5cf] bg-[#f8f8f6] py-2.5 pl-9 pr-4 font-mono text-sm outline-none transition focus:border-[#11161a] focus:bg-white disabled:opacity-50"
            placeholder="Enter local private-state password"
          />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[#707e8c]">
          This password encrypts the browser-local witness store. It is held in memory only for the
          current session and is never sent to a server, API, or log.
        </p>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isUnlocking || password.length === 0}
          className="mt-6 w-full rounded-full bg-[#11161a] py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUnlocking ? 'Attaching verified contract client…' : 'Unlock and connect'}
        </button>
      </form>
    </div>
  );
};
