import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const recordPath = path.join(rootDir, 'src/contracts/deployed-contract.json');
const evidencePath = path.join(rootDir, 'src/contracts/deployment-verification.json');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function normalize(value) {
  return String(value || '').replace(/^0x/, '').toLowerCase();
}

const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
const claimsDeployment =
  record.deploymentStatus === 'confirmed' || record.verifiedOnChain === true;

if (!claimsDeployment) {
  console.log('✅ Release gate: canonical record does not claim a deployment.');
  process.exit(0);
}

if (!fs.existsSync(evidencePath)) {
  fail('❌ Release gate: deployment record claims confirmation but no verification evidence is committed.');
}

const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
const requiredFindings = [
  'contractFoundOnChain',
  'transactionFoundOnChain',
  'contractDeployedByTransaction',
];
const missing = requiredFindings.filter((field) => evidence[field] !== true);
if (missing.length > 0) {
  fail(`❌ Release gate: verification evidence is missing required findings: ${missing.join(', ')}`);
}
if (normalize(evidence.claimedContractAddress) !== normalize(record.contractAddress)) {
  fail('❌ Release gate: verified contract address does not match the canonical record.');
}
if (normalize(evidence.claimedDeployTxHash) !== normalize(record.deployTxHash)) {
  fail('❌ Release gate: verified deploy transaction does not match the canonical record.');
}
if (!evidence.checkedAt || !evidence.indexer || evidence.source === 'not-checked') {
  fail('❌ Release gate: verification evidence has no verified source and timestamp.');
}

console.log('✅ Release gate: deployment claim is backed by committed indexer evidence.');
