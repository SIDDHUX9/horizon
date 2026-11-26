import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyDeploymentClaim, normalizeHex } from './lib/deployment-verification.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const RECORD_PATH = path.resolve(ROOT_DIR, 'src/contracts/deployed-contract.json');
const INDEXER = process.env.MIDNIGHT_INDEXER || 'https://preview-service-v2-01.midnightexplorer.com/api/v1';
const GRAPHQL_URL = process.env.MIDNIGHT_INDEXER_GRAPHQL;
const PROJECT_ID = process.env.MIDNIGHT_INDEXER_PROJECT_ID;

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, '');
    if (!key || !argv[index + 1] || argv[index + 1].startsWith('--')) {
      throw new Error(`Invalid argument near ${argv[index] ?? '<missing>'}.`);
    }
    values[key] = argv[index + 1];
  }
  return values;
}

function isHex64(value) {
  return /^[0-9a-fA-F]{64}$/.test(value || '');
}

export function buildConfirmedRecord(existing, claim, address, txHash) {
  return {
    ...existing,
    network: existing.network,
    deploymentStatus: 'confirmed',
    verifiedOnChain: true,
    contractAddress: `0x${normalizeHex(address)}`,
    deployTxHash: `0x${normalizeHex(txHash)}`,
    deployerAddress: existing.deployerAddress ?? null,
    blockHeight: claim.blockHeight,
    blockHash: claim.blockHash,
    timestamp:
      typeof claim.timestamp === 'number'
        ? new Date(claim.timestamp).toISOString()
        : existing.timestamp ?? null,
    verification: {
      checkedAt: new Date().toISOString(),
      indexer: GRAPHQL_URL && PROJECT_ID ? GRAPHQL_URL : INDEXER,
      status: 'verified',
      contractFoundOnChain: true,
      transactionFoundOnChain: true,
      contractDeployedByTransaction: true,
      source: claim.source,
      note: 'Confirmed from the indexer after a real broadcast. Circuit calls remain subject to network matching and artifact integrity checks.',
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const address = normalizeHex(args.address);
  const txHash = normalizeHex(args.tx);
  if (!isHex64(address) || !isHex64(txHash)) {
    throw new Error('Usage: node scripts/confirm-deployment.js --address <64-hex> --tx <64-hex>');
  }

  const existing = JSON.parse(fs.readFileSync(RECORD_PATH, 'utf8'));
  const claim = await verifyDeploymentClaim({
    indexer: INDEXER,
    contractAddress: address,
    deployTxHash: txHash,
    graphqlUrl: GRAPHQL_URL,
    projectId: PROJECT_ID,
  });

  const confirmed =
    claim.contractFoundOnChain &&
    claim.transactionFoundOnChain &&
    claim.contractDeployedByTransaction;
  if (!confirmed) {
    console.error('❌ Claim not confirmed. The canonical record was not changed.');
    console.error(JSON.stringify(claim, null, 2));
    process.exit(1);
  }

  const record = buildConfirmedRecord(existing, claim, address, txHash);
  const temporaryPath = `${RECORD_PATH}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(record, null, 2) + '\n');
  fs.renameSync(temporaryPath, RECORD_PATH);

  console.log('✅ Canonical deployment record updated from independently verified indexer data.');
  console.log('Run npm run verify:deployment before advertising the deployment.');
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((error) => {
    console.error('❌ Deployment confirmation failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
