import deploymentRecord from '../contracts/deployed-contract.json';

export interface DeploymentRecord {
  network: string;
  deploymentStatus: string;
  verifiedOnChain: boolean;
  contractAddress: string | null;
  deployTxHash: string | null;
  blockHeight?: number | null;
  timestamp?: string;
  verification?: {
    verifiedOnChain?: boolean;
    contractFoundOnChain?: boolean;
    transactionFoundOnChain?: boolean;
    checkedAt?: string;
    indexer?: string;
  };
}

const record = deploymentRecord as unknown as DeploymentRecord;

export class DeploymentNotVerifiedError extends Error {
  constructor(reason: string) {
    super(`Circuit calls are disabled: ${reason}. Run npm run verify:deployment for details.`);
    this.name = 'DeploymentNotVerifiedError';
  }
}

/**
 * Hard gate for all production protocol operations.
 * Returns the verified contract address only when the canonical record
 * carries an independently confirmed deployment on the expected network.
 * Throws otherwise. No circuit call may bypass this function.
 */
export function assertVerifiedDeployment(networkId: string): string {
  if (record.deploymentStatus !== 'confirmed' || record.verifiedOnChain !== true) {
    throw new DeploymentNotVerifiedError(
      'the canonical deployment record is not confirmed'
    );
  }
  if (record.verification?.verifiedOnChain !== true) {
    throw new DeploymentNotVerifiedError(
      'independent indexer verification is missing from the record'
    );
  }
  if (!record.contractAddress || !/^[0-9a-fA-F]{64}$/.test(record.contractAddress)) {
    throw new DeploymentNotVerifiedError('the recorded contract address is invalid');
  }
  if (!record.deployTxHash || !/^[0-9a-fA-F]{64}$/.test(record.deployTxHash)) {
    throw new DeploymentNotVerifiedError('the recorded deploy transaction hash is invalid');
  }
  if (record.network !== networkId) {
    throw new DeploymentNotVerifiedError(
      `recorded network (${record.network}) does not match connected network (${networkId})`
    );
  }
  return record.contractAddress;
}

/** Non-throwing check for UI state. */
export function isDeploymentVerified(networkId?: string): boolean {
  try {
    assertVerifiedDeployment(networkId || record.network);
    return true;
  } catch {
    return false;
  }
}

export function getDeploymentRecord(): Readonly<DeploymentRecord> {
  return record;
}
