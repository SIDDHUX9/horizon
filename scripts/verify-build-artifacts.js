import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { printArtifactReport, verifyArtifacts } from './lib/artifact-integrity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distContracts = path.join(rootDir, 'dist/contracts');
const clientPath = path.join(rootDir, 'src/services/midnightProtocolClient.ts');

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(distContracts)) {
  fail(`❌ No built contract artifacts at ${path.relative(rootDir, distContracts)}. Run npm run build first.`);
}

const report = verifyArtifacts(distContracts);
printArtifactReport(report);
if (!report.ok) process.exit(1);

const clientSource = fs.readFileSync(clientPath, 'utf8');
const pinned = clientSource.match(/EXPECTED_MANIFEST_HASH\s*=\s*'([0-9a-f]{64})'/);
if (!pinned) {
  fail('❌ Could not read EXPECTED_MANIFEST_HASH from the browser client.');
}
if (pinned[1] !== report.manifestHash) {
  fail(
    `❌ Built artifact manifest ${report.manifestHash} does not match the pinned client hash ${pinned[1]}.`
  );
}

console.log('✅ Built /contracts/ artifacts match the pinned browser client manifest.');
