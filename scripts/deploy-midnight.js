import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { printArtifactReport, verifyArtifacts } from './lib/artifact-integrity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const recordPath = path.resolve(ROOT_DIR, 'src/contracts/deployed-contract.json');
const networkId = process.env.MIDNIGHT_NETWORK || 'preview';
const proofServerUrl = process.env.MIDNIGHT_PROOF_SERVER || 'http://127.0.0.1:6300';
const indexerUrl =
  process.env.MIDNIGHT_INDEXER || 'https://preview-service-v2-01.midnightexplorer.com/api/v1';

async function checkProofServer() {
  try {
    const response = await fetch(proofServerUrl, { signal: AbortSignal.timeout(5000) });
    return { reachable: true, status: response.status };
  } catch (error) {
    return { reachable: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function checkIndexer() {
  const response = await fetch(`${indexerUrl}/blocks/latest?limit=1`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Indexer returned HTTP ${response.status}`);
  const json = await response.json();
  const block = json.data?.[0];
  if (!block) throw new Error('Indexer returned no blocks');
  return block;
}

async function main() {
  console.log('====================================================================');
  console.log('HORIZON: MIDNIGHT DEPLOYMENT PREFLIGHT');
  console.log(`Network:      ${networkId}`);
  console.log(`Proof server: ${proofServerUrl}`);
  console.log(`Indexer:      ${indexerUrl}`);
  console.log('====================================================================\n');

  const artifacts = verifyArtifacts();
  printArtifactReport(artifacts);

  const server = await checkProofServer();
  if (!server.reachable) throw new Error(`Proof server unreachable: ${server.error}`);
  console.log(`✅ Proof server responded with HTTP ${server.status}.`);

  const block = await checkIndexer();
  console.log(`✅ Live indexer responded at block ${block.height ?? 'unknown'}.`);

  const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
  if (record.verifiedOnChain || record.deploymentStatus === 'confirmed') {
    console.log('\nCanonical record already claims a verified deployment.');
    console.log('Run npm run verify:deployment before changing it.');
    return;
  }

  console.log('\n====================================================================');
  console.log('PREFLIGHT PASSED — NO DEPLOYMENT TRANSACTION WAS BUILT OR BROADCAST');
  console.log('====================================================================');
  console.log('A production deployment requires the wallet-backed contract client to');
  console.log('prove and submit a deploy transaction, followed by independent indexer');
  console.log('verification. This script intentionally does not fabricate an address,');
  console.log('proof hash, or transaction hash.');
}

main().catch((error) => {
  console.error('❌ Deployment preflight failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
