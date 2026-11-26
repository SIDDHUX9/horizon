/** Explorer links are public URLs; no API keys or secrets belong here. */
const EXPLORER_BASE_URL = (
  import.meta.env.VITE_EXPLORER_URL || 'https://preview.midnightexplorer.com'
).replace(/\/$/, '');

export function explorerTransactionUrl(hash: string): string {
  return `${EXPLORER_BASE_URL}/transactions/${encodeURIComponent(hash)}`;
}

export function explorerContractUrl(address: string): string {
  return `${EXPLORER_BASE_URL}/contracts/${encodeURIComponent(address)}`;
}

export function explorerBlockUrl(height: number | string): string {
  return `${EXPLORER_BASE_URL}/blocks/${encodeURIComponent(String(height))}`;
}
