export interface LaceWalletState {
  isInstalled: boolean;
  isConnected: boolean;
  address: string | null;
  error: string | null;
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        name: string;
        apiVersion: string;
        enable: () => Promise<{
          getUnshieldedAddress?: () => Promise<string>;
          getShieldedAddress?: () => Promise<string>;
          state?: () => Promise<{ address?: string; coinPublicKey?: string }>;
          getAccounts?: () => Promise<string[]>;
        }>;
        isEnabled: () => Promise<boolean>;
      };
    };
  }
}

export async function detectLaceWallet(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return Boolean(window.midnight && window.midnight.mnLace);
}

export async function connectLaceWallet(): Promise<{ address: string; api: any }> {
  if (typeof window === 'undefined') {
    throw new Error('Window context not available');
  }

  const mnLace = window.midnight?.mnLace;
  if (!mnLace) {
    throw new Error(
      'Midnight Lace wallet extension not detected. Please install the Midnight Lace Wallet extension in your browser.'
    );
  }

  try {
    const api = await mnLace.enable();
    let address: string | null = null;

    if (typeof api.getUnshieldedAddress === 'function') {
      address = await api.getUnshieldedAddress();
    } else if (typeof api.state === 'function') {
      const state = await api.state();
      address = state.address || state.coinPublicKey || null;
    } else if (typeof api.getAccounts === 'function') {
      const accounts = await api.getAccounts();
      address = accounts[0] || null;
    }

    if (!address) {
      throw new Error('Lace wallet enabled, but no Midnight address was returned by the extension.');
    }

    return { address, api };
  } catch (err: any) {
    if (err.message && err.message.includes('User rejected')) {
      throw new Error('Connection request was declined in Lace wallet.');
    }
    throw new Error(err.message || 'Failed to connect to Midnight Lace wallet.');
  }
}
