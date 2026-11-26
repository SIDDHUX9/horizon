import { LaceConnectedSession } from './laceWallet';
import { horizon } from '../contracts/horizonSimulator';
import deployedContractData from '../contracts/deployed-contract.json';
import { MidnightLiveIndexer } from './midnightLiveIndexer';
import { explorerContractUrl } from './explorerUrls';

export interface PreparedDeployData {
  success: boolean;
  contractAddress: string;
  rawContractAddress: string;
  unsealedTxHex: string;
  zkProofHash: string;
  circuits: string[];
  networkId: string;
}

export interface DeploymentVerification {
  verifiedOnChain?: boolean;
  contractFoundOnChain?: boolean;
  transactionFoundOnChain?: boolean;
  checkedAt: string;
  indexer: string;
  status?: string;
  note?: string;
}

export interface DeploymentRecord {
  network: string;
  deploymentStatus?: 'not-deployed' | 'prepared-not-broadcast' | 'pending-verification' | 'confirmed';
  verifiedOnChain: boolean;
  contractAddress: string | null;
  deployTxHash: string | null;
  deployerAddress: string | null;
  blockHeight: number | null;
  blockHash: string | null;
  timestamp: string | null;
  circuits: string[];
  explorerUrl: string | null;
  contractExplorerUrl: string | null;
  verification?: DeploymentVerification;
}

export type DeployStep =
  | 'idle'
  | 'preparing_proof'
  | 'awaiting_lace'
  | 'submitting'
  | 'confirming_block'
  | 'finalized'
  | 'failed';

const INDEXER_BASE = 'https://preview-service-v2-01.midnightexplorer.com/api/v1';

export class HorizonDeployer {
  static async checkStatus(): Promise<{
    proofServerOnline: boolean;
    proofServerUrl: string;
    networkId: string;
    deployedContract: DeploymentRecord | null;
  }> {
    const fallbackRecord = deployedContractData as DeploymentRecord;
    try {
      const res = await fetch('/api/midnight/status');
      if (res.ok) {
        const json = await res.json();
        return {
          ...json,
          deployedContract: json.deployedContract || fallbackRecord,
        };
      }
    } catch {
      // The endpoint is only present in the Vite dev server.
    }

    return {
      proofServerOnline: false,
      proofServerUrl: 'http://127.0.0.1:6300',
      networkId: 'preview',
      deployedContract: fallbackRecord,
    };
  }

  static async prepareDeployTransaction(): Promise<PreparedDeployData> {
    const res = await fetch('/api/midnight/prepare-deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(
        errJson.error ||
        'Deployment proof preparation requires the Vite dev API and a local proof server on port 6300. Static production builds do not expose this endpoint.'
      );
    }
    return await res.json();
  }

  static async recordDeployment(data: {
    contractAddress: string;
    deployTxHash: string;
    deployerAddress: string;
    blockHeight?: number | null;
    blockHash?: string | null;
  }): Promise<DeploymentRecord> {
    const res = await fetch('/api/midnight/record-deployment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to persist deployment record (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json.record;
  }

  private static async waitForIndexer(query: string, attempts = 5): Promise<boolean> {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const result = await MidnightLiveIndexer.searchOnChain(query);
      const matches = result?.matches;
      if (Array.isArray(matches) && matches.length > 0) return true;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }
    return false;
  }

  static async executeOnChainDeployment(
    session: LaceConnectedSession,
    onStepChange?: (step: DeployStep, message: string) => void
  ): Promise<DeploymentRecord> {
    if (!session || !session.api) {
      throw new Error('No active Midnight Lace wallet session. Please connect your wallet first.');
    }

    onStepChange?.('preparing_proof', 'Generating a locally proven deploy transaction on the configured proof server...');
    const prepared = await this.prepareDeployTransaction();

    onStepChange?.('awaiting_lace', 'Awaiting wallet authorization to sign and balance transaction fees...');
    let balancedTxHex = '';
    try {
      if (typeof session.api.balanceUnsealedTransaction !== 'function') {
        throw new Error('Connected wallet does not support balanceUnsealedTransaction.');
      }
      const balanceRes = await session.api.balanceUnsealedTransaction(prepared.unsealedTxHex, { payFees: true });
      balancedTxHex = typeof balanceRes === 'string' ? balanceRes : (balanceRes?.tx || '');
      if (!balancedTxHex) throw new Error('Wallet did not return a balanced transaction.');
    } catch (err: any) {
      onStepChange?.('failed', err?.message || 'Transaction rejected in wallet.');
      throw new Error(`Wallet balancing failed: ${err?.message || 'Unknown error'}`);
    }

    onStepChange?.('submitting', 'Submitting the balanced deployment transaction...');
    let broadcastTxHash = prepared.zkProofHash;
    try {
      if (typeof session.api.submitTransaction !== 'function') {
        throw new Error('Connected wallet does not support submitTransaction.');
      }
      const submitRes = await session.api.submitTransaction(balancedTxHex);
      if (typeof submitRes === 'string' && submitRes) broadcastTxHash = submitRes;
    } catch (err: any) {
      onStepChange?.('failed', err?.message || 'Submission failed.');
      throw new Error(`Transaction broadcast failed: ${err?.message || 'Unknown error'}`);
    }

    onStepChange?.('confirming_block', 'Checking the live indexer for transaction inclusion...');
    const transactionFoundOnChain = await this.waitForIndexer(broadcastTxHash);
    const contractFoundOnChain = await this.waitForIndexer(prepared.rawContractAddress || prepared.contractAddress);

    if (!transactionFoundOnChain || !contractFoundOnChain) {
      onStepChange?.(
        'failed',
        'Transaction was submitted but could not be confirmed on the indexer. No verified deployment record was written.'
      );
      throw new Error('Deployment could not be verified on-chain. The canonical deployment record was left unchanged.');
    }

    const verification: DeploymentVerification = {
      verifiedOnChain: true,
      contractFoundOnChain,
      transactionFoundOnChain,
      checkedAt: new Date().toISOString(),
      indexer: INDEXER_BASE,
    };

    onStepChange?.('finalized', `Deployment verified on the indexer at ${prepared.contractAddress}`);
    const record = await this.recordDeployment({
      contractAddress: prepared.contractAddress,
      deployTxHash: broadcastTxHash,
      deployerAddress: session.unshieldedAddress,
      blockHeight: null,
      blockHash: null,
    });

    horizon.recordOnChainTransaction({
      tx_hash: broadcastTxHash,
      block_height: record.blockHeight ?? 0,
      circuit: 'Contract Deployment',
      caller: session.unshieldedAddress,
      timestamp: Date.now(),
      onchain_confirmed: true,
      explorer_url: explorerContractUrl(prepared.contractAddress),
      public_data: {
        contract_address: prepared.contractAddress,
        circuits_deployed: '5 circuits',
        network: 'Midnight Preview Testnet',
        indexer_verified: verification.checkedAt,
      },
      hidden_private_data: {
        witness_status: 'Not applicable to contract deployment.',
      },
      proof_verified: true,
    });

    return { ...record, verification };
  }
}
