import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyDeploymentClaim } from './lib/deployment-verification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const RECORD_PATH = path.resolve(ROOT_DIR, 'src/contracts/deployed-contract.json');
const REPORT_PATH = path.resolve(ROOT_DIR, 'src/contracts/deployment-verification.json');
const INDEXER = process.env.MIDNIGHT_INDEXER || 'https://preview-service-v2-01.midnightexplorer.com/api/v1';
const GRAPHQL_URL = process.env.MIDNIGHT_INDEXER_GRAPHQL;
const PROJECT_ID = process.env.MIDNIGHT_INDEXER_PROJECT_ID;

async function main() {
  console.log('====================================================================');
  console.log('🔍 HORIZON: DEPLOYMENT VERIFICATION AGAINST LIVE INDEXER');
  console.log(`Source:   ${GRAPHQL_URL && PROJECT_ID ? 'authenticated indexer GraphQL' : 'public explorer REST'}`);
  console.log(`Indexer:  ${INDEXER}`);
  console.log('====================================================================\n');

  if (!fs.existsSync(RECORD_PATH)) {
    console.error('❌ No deployment record found at', RECORD_PATH);
    process.exit(1);
  }

  const record = JSON.parse(fs.readFileSync(RECORD_PATH, 'utf8'));
  const declaredNotDeployed = record.status === 'not-deployed' || record.deploymentStatus === 'not-deployed';
  if (declaredNotDeployed || !record.contractAddress || !record.deployTxHash) {
    const reason = declaredNotDeployed ? 'not deployed' : 'incomplete record';
    console.log(`ℹ️  Deployment record is ${reason}. Nothing to verify on-chain.\n`);
    const report = {
      checkedAt: new Date().toISOString(),
      indexer: INDEXER,
      source: 'not-checked',
      status: 'not-deployed',
      claimedContractAddress: record.contractAddress || null,
      claimedDeployTxHash: record.deployTxHash || null,
      contractFoundOnChain: false,
      transactionFoundOnChain: false,
      contractDeployedByTransaction: false,
      chainTip: null,
      note: 'Record explicitly declares that no verified deployment exists. This is the expected state until a real broadcast is confirmed.',
    };
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
    console.log(`✅ Wrote honest verification report to ${path.relative(ROOT_DIR, REPORT_PATH)}`);
    return;
  }

  const result = await verifyDeploymentClaim({
    indexer: INDEXER,
    contractAddress: record.contractAddress,
    deployTxHash: record.deployTxHash,
    graphqlUrl: GRAPHQL_URL,
    projectId: PROJECT_ID,
  });
  const claimIsTrue =
    result.contractFoundOnChain &&
    result.transactionFoundOnChain &&
    result.contractDeployedByTransaction;

  const report = {
    checkedAt: new Date().toISOString(),
    indexer: GRAPHQL_URL && PROJECT_ID ? GRAPHQL_URL : INDEXER,
    source: result.source,
    status: claimIsTrue ? 'verified' : 'claim-failed',
    claimedContractAddress: record.contractAddress,
    claimedDeployTxHash: record.deployTxHash,
    claimedBlockHeight: record.blockHeight ?? null,
    observedBlockHeight: result.blockHeight,
    contractFoundOnChain: result.contractFoundOnChain,
    transactionFoundOnChain: result.transactionFoundOnChain,
    contractDeployedByTransaction: result.contractDeployedByTransaction,
    note: claimIsTrue
      ? 'The contract, deployment transaction, and their on-chain relationship were confirmed by the indexer.'
      : 'The deployment claim was not fully confirmed. Do not advertise it as verified.',
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');

  console.log(`Source:                     ${result.source}`);
  console.log(`Observed block height:      ${result.blockHeight ?? 'unknown'}`);
  console.log(`Contract found on chain:    ${result.contractFoundOnChain ? 'YES' : 'NO'}`);
  console.log(`Deploy tx found on chain:   ${result.transactionFoundOnChain ? 'YES' : 'NO'}`);
  console.log(`Tx deployed this contract:  ${result.contractDeployedByTransaction ? 'YES' : 'NO'}`);
  console.log(`Report written to:          ${path.relative(ROOT_DIR, REPORT_PATH)}\n`);

  if (!claimIsTrue) {
    console.error('❌ DEPLOYMENT CLAIM FAILED VERIFICATION.');
    process.exit(1);
  }
  console.log('✅ Deployment claim verified against the live indexer.');
}

main().catch((error) => {
  console.error('❌ Verification error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
