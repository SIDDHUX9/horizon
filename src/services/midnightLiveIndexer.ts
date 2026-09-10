export interface MidnightBlock {
  height: number;
  hash: string;
  parentHash: string;
  author: string;
  timestamp: number;
  protocolVersion: number;
  txCount: number;
}

export interface MidnightTx {
  hash: string;
  type: string;
  status: string;
  entryPoint: string | null;
  actionType: string;
  blockHeight: number;
  timestamp: number;
  paidFees: string;
}

export interface NetworkStats {
  blockHeight: number;
  totalTransactions?: number;
  network: string;
}

const INDEXER_BASE = 'https://preview-service-v2-01.midnightexplorer.com/api/v1';

export class MidnightLiveIndexer {
  static async getLatestBlocks(limit = 5): Promise<MidnightBlock[]> {
    try {
      const res = await fetch(`${INDEXER_BASE}/blocks/latest?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('Live indexer fetch error (blocks):', err);
      return [];
    }
  }

  static async getLatestTransactions(limit = 10): Promise<MidnightTx[]> {
    try {
      const res = await fetch(`${INDEXER_BASE}/transactions/latest?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('Live indexer fetch error (txs):', err);
      return [];
    }
  }

  static async searchOnChain(query: string): Promise<any> {
    try {
      const res = await fetch(`${INDEXER_BASE}/search/graphql?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.warn('Live indexer search error:', err);
      return null;
    }
  }
}
