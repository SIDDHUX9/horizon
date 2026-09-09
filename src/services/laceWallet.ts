import type { InitialAPI, ConnectedAPI, Configuration } from '@midnight-ntwrk/dapp-connector-api';

export interface DiscoveredWallet {
  id: string;
  name: string;
  rdns: string;
  icon: string;
  apiVersion: string;
  raw: InitialAPI;
}

export interface LaceConnectedSession {
  walletName: string;
  unshieldedAddress: string;
  shieldedAddress?: string;
  dustAddress?: string;
  dustBalance?: bigint;
  dustCap?: bigint;
  config?: Configuration;
  api: ConnectedAPI;
}

/**
 * Discovers any Midnight DApp Connector compatible wallets injected into window.midnight.
 * Per CAIP-372 and Midnight DApp Connector v4.x spec, wallets register under window.midnight[walletId].
 */
export function getAvailableMidnightWallets(): DiscoveredWallet[] {
  if (typeof window === 'undefined' || !window.midnight) {
    return [];
  }

  const wallets: DiscoveredWallet[] = [];
  const midnightObj = window.midnight as Record<string, any>;

  for (const [key, val] of Object.entries(midnightObj)) {
    if (val && typeof val === 'object') {
      wallets.push({
        id: key,
        name: val.name || (key.toLowerCase().includes('lace') ? 'Lace Midnight Wallet' : key),
        rdns: val.rdns || 'io.lace.midnight',
        icon: val.icon || '',
        apiVersion: val.apiVersion || 'unknown',
        raw: val as InitialAPI,
      });
    }
  }

  return wallets;
}

/**
 * Checks if at least one Midnight wallet (specifically Lace) is detected.
 */
export async function detectLaceWallet(): Promise<boolean> {
  const wallets = getAvailableMidnightWallets();
  return wallets.length > 0;
}

export const SUPPORTED_MIDNIGHT_NETWORKS = ['preview', 'preprod', 'undeployed', 'mainnet'] as const;
export type MidnightNetworkId = typeof SUPPORTED_MIDNIGHT_NETWORKS[number];

/**
 * Connects to the Midnight Lace wallet using the official DApp Connector API connect() method.
 * Strict: Never returns fallback or placeholder address.
 */
export async function connectLaceWallet(
  walletId?: string,
  networkId: MidnightNetworkId | string = 'preview'
): Promise<LaceConnectedSession> {
  const wallets = getAvailableMidnightWallets();
  if (wallets.length === 0) {
    throw new Error(
      'Midnight Lace wallet extension not detected. Please install Midnight Lace from the Chrome Web Store and refresh the page.'
    );
  }

  // Find preferred Lace wallet or target ID
  const targetWallet = walletId
    ? wallets.find((w) => w.id === walletId)
    : wallets.find(
        (w) =>
          w.id === 'mnLace' ||
          w.name.toLowerCase().includes('lace') ||
          w.rdns.toLowerCase().includes('lace')
      ) || wallets[0];

  if (!targetWallet) {
    throw new Error(`Target Midnight wallet '${walletId}' not found.`);
  }

  const initialApi = targetWallet.raw;
  let connectedApi: ConnectedAPI;

  try {
    // Official DApp Connector API v4.x connect(networkId)
    if (typeof initialApi.connect === 'function') {
      connectedApi = await initialApi.connect(networkId);
    } else if (typeof (initialApi as any).enable === 'function') {
      // Legacy v3 compatibility
      connectedApi = await (initialApi as any).enable();
    } else {
      throw new Error(`Injected wallet '${targetWallet.name}' has no connect() or enable() method.`);
    }
  } catch (err: any) {
    if (err.message && err.message.toLowerCase().includes('reject')) {
      throw new Error('Connection request was declined in Midnight Lace wallet.');
    }
    throw new Error(err.message || 'Failed to authenticate with Midnight Lace wallet.');
  }

  // Hint methods to wallet for permissions
  if (typeof connectedApi.hintUsage === 'function') {
    try {
      await connectedApi.hintUsage([
        'getUnshieldedAddress',
        'getShieldedAddresses',
        'getDustAddress',
        'getDustBalance',
        'getUnshieldedBalances',
        'submitTransaction',
        'balanceUnsealedTransaction',
        'getConfiguration',
      ]);
    } catch {
      // Hint is advisory
    }
  }

  // Retrieve unshielded Bech32m address
  let unshieldedAddress = '';
  if (typeof connectedApi.getUnshieldedAddress === 'function') {
    const res = await connectedApi.getUnshieldedAddress();
    unshieldedAddress = res.unshieldedAddress;
  } else if (typeof (connectedApi as any).state === 'function') {
    const state = await (connectedApi as any).state();
    unshieldedAddress = state.address || state.coinPublicKey || '';
  }

  if (!unshieldedAddress) {
    throw new Error('Connected to Lace, but no unshielded address was provided by the extension.');
  }

  // Retrieve optional shielded addresses
  let shieldedAddress: string | undefined;
  if (typeof connectedApi.getShieldedAddresses === 'function') {
    try {
      const s = await connectedApi.getShieldedAddresses();
      shieldedAddress = s.shieldedAddress;
    } catch {}
  }

  // Retrieve Dust balance
  let dustBalance: bigint | undefined;
  let dustCap: bigint | undefined;
  if (typeof connectedApi.getDustBalance === 'function') {
    try {
      const d = await connectedApi.getDustBalance();
      dustBalance = d.balance;
      dustCap = d.cap;
    } catch {}
  }

  // Retrieve active network configuration
  let config: Configuration | undefined;
  if (typeof connectedApi.getConfiguration === 'function') {
    try {
      config = await connectedApi.getConfiguration();
    } catch {}
  }

  return {
    walletName: targetWallet.name,
    unshieldedAddress,
    shieldedAddress,
    dustBalance,
    dustCap,
    config,
    api: connectedApi,
  };
}
