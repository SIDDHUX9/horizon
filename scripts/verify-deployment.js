import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const RECORD_PATH = path.resolve(ROOT_DIR, 'src/contracts/deployed-contract.json');
const REPORT_PATH = path.resolve(ROOT_DIR, 'src/contracts/deployment-verification.json');
const INDEXER = process.env.MIDNIGHT_INDEXER || 'https://preview-service-v2-01.midnightexplorer.com/api/v1';

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { timeout: 10000 }, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject)
      .on('timeout', function onTimeout() {
        this.destroy(new Error(`Timeout requesting ${url}`));
      });
  });
}

async function search(query) {
  const json = await getJson(`${INDEXER}/search/graphql?q=${encodeURIComponent(query)}`);
  return Array.isArray(json.data?.matches) ? json.data.matches : [];
}

async function main() {
  console.log('====================================================================');
  console.log('🔍 HORIZON: DEPLOYMENT VERIFICATION AGAINST LIVE INDEXER');
  console.log(`Indexer: ${INDEXER}`);
  console.log('====================================================================\n');

  if (!fs.existsSync(RECORD_PATH)) {
    console.error('❌ No deployment record found at', RECORD_PATH);
    process.exit(1);
  }

  const record = JSON.parse(fs.readFileSync(RECORD_PATH, 'utf8'));

  if (record.status === 'not-deployed' || !record.contractAddress || !record.deployTxHash) {
    const reason = record.status === 'not-deployed' ? 'not deployed' : 'incomplete record';
    console.log(`ℹ️  Deployment record is ${reason}. Nothing to verify on-chain.\n`);
    const report = {
      checkedAt: new Date().toISOString(),
      indexer: INDEXER,
      status: 'not-deployed',
      claimedContractAddress: record.contractAddress || null,
      claimedDeployTxHash: record.deployTxHash || null,
      contractFoundOnChain: false,
      transactionFoundOnChain: false,
      chainTip: null,
      note: 'Record explicitly declares that no verified deployment exists. This is the expected state until a real broadcast is confirmed.',
    };
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
    console.log(`✅ Wrote honest verification report to ${path.relative(ROOT_DIR, REPORT_PATH)}`);
    return;
  }

  const blocks = await getJson(`${INDEXER}/blocks/latest?limit=1`);
  const chainTip = blocks.data?.[0]?.height ?? null;
  const addressMatches = await search(record.contractAddress);
  const txMatches = await search(record.deployTxHash);

  const contractFoundOnChain = addressMatches.length > 0;
  const transactionFoundOnChain = txMatches.length > 0;
  const claimIsTrue = contractFoundOnChain && transactionFoundOnChain;

  const report = {
    checkedAt: new Date().toISOString(),
    indexer: INDEXER,
    status: claimIsTrue ? 'verified' : 'claim-failed',
    claimedContractAddress: record.contractAddress,
    claimedDeployTxHash: record.deployTxHash,
    claimedBlockHeight: record.blockHeight ?? null,
    chainTip,
    claimedHeightExceedsChainTip:
      typeof record.blockHeight === 'number' && typeof chainTip === 'number' && record.blockHeight > chainTip,
    contractFoundOnChain,
    transactionFoundOnChain,
    note: claimIsTrue
      ? 'Both the contract address and deployment transaction were found on the live indexer.'
      : 'The claimed contract address and/or transaction could not be found on the live indexer. Do not advertise this deployment as verified.',
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');

  console.log(`Chain tip:                 ${chainTip ?? 'unknown'}`);
  console.log(`Claimed block height:      ${record.blockHeight ?? 'n/a'}`);
  console.log(`Contract found on chain:   ${contractFoundOnChain ? 'YES' : 'NO'}`);
  console.log(`Deploy tx found on chain:  ${transactionFoundOnChain ? 'YES' : 'NO'}`);
  console.log(`Report written to:         ${path.relative(ROOT_DIR, REPORT_PATH)}\n`);

  if (!claimIsTrue) {
    console.error('❌ DEPLOYMENT CLAIM FAILED VERIFICATION.');
    process.exit(1);
  }
  console.log('✅ Deployment claim verified against the live indexer.');
}

main().catch((error) => {
  console.error('❌ Verification error:', error.message);
  process.exit(1);
});
