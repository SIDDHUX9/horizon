import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const COMPILED_DIR = path.resolve(__dirname, '../../src/contracts/compiled');
export const MANIFEST_PATH = path.join(COMPILED_DIR, 'compiler/contract-manifest.json');

export const EXPECTED_TOOLCHAIN = {
  compilerVersion: '0.36.1',
  languageVersion: '0.28.0',
  runtimeVersion: '0.21.0',
};

export const REQUIRED_CIRCUITS = [
  'createLendingPool',
  'submitFinancialSnapshot',
  'requestLoan',
  'repayLoan',
  'liquidate',
];

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Fail-closed verification of compactc output. This is the same manifest that
 * Midnight.js 5 ZK config providers check before proving, so a mismatch here
 * means the browser artifacts cannot safely be used.
 */
export function verifyArtifacts() {
  const errors = [];

  if (!fs.existsSync(MANIFEST_PATH)) {
    return {
      ok: false,
      errors: [`Missing compiler manifest at ${path.relative(process.cwd(), MANIFEST_PATH)}`],
    };
  }

  const manifest = readJson(MANIFEST_PATH);
  const checks = [
    ['compiler-version', manifest['compiler-version'], EXPECTED_TOOLCHAIN.compilerVersion],
    ['language-version', manifest['language-version'], EXPECTED_TOOLCHAIN.languageVersion],
    ['runtime-version', manifest['runtime-version'], EXPECTED_TOOLCHAIN.runtimeVersion],
  ];

  for (const [field, actual, expected] of checks) {
    if (actual !== expected) {
      errors.push(`${field}: expected ${expected}, found ${actual ?? 'missing'}`);
    }
  }

  const walk = (node, relative) => {
    if (!node || node.type !== 'directory') return;
    for (const [name, entry] of Object.entries(node)) {
      if (name === 'type' || !entry || typeof entry !== 'object') continue;
      const childRelative = relative ? `${relative}/${name}` : name;
      if (entry.type === 'directory') {
        walk(entry, childRelative);
      } else if (entry.type === 'file') {
        const filePath = path.join(COMPILED_DIR, childRelative);
        if (!fs.existsSync(filePath)) {
          errors.push(`Missing manifest artifact ${childRelative}`);
          continue;
        }
        const buffer = fs.readFileSync(filePath);
        if (buffer.length !== entry.size) {
          errors.push(`${childRelative}: expected ${entry.size} bytes, found ${buffer.length}`);
        }
        const actualHash = sha256(buffer);
        if (actualHash !== entry.hash) {
          errors.push(`${childRelative}: hash mismatch (manifest ${entry.hash}, found ${actualHash})`);
        }
      }
    }
  };

  for (const section of ['compiler', 'contract', 'zkir', 'keys']) {
    walk(manifest[section], section);
  }

  for (const circuit of REQUIRED_CIRCUITS) {
    for (const relative of [
      `zkir/${circuit}.bzkir`,
      `keys/${circuit}.prover`,
      `keys/${circuit}.verifier`,
    ]) {
      if (!fs.existsSync(path.join(COMPILED_DIR, relative))) {
        errors.push(`Missing required circuit artifact ${relative}`);
      }
    }
  }

  const generatedBindings = fs.readFileSync(path.join(COMPILED_DIR, 'contract/index.js'), 'utf8');
  if (!generatedBindings.includes(`checkRuntimeVersion('${EXPECTED_TOOLCHAIN.runtimeVersion}')`)) {
    errors.push(`Generated bindings do not declare runtime ${EXPECTED_TOOLCHAIN.runtimeVersion}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    manifest,
    manifestHash: sha256(fs.readFileSync(MANIFEST_PATH)),
  };
}

export function printArtifactReport(report) {
  if (report.ok) {
    console.log(`✅ Compact artifacts verified (compactc ${EXPECTED_TOOLCHAIN.compilerVersion}, runtime ${EXPECTED_TOOLCHAIN.runtimeVersion}).`);
    console.log(`   Manifest SHA-256: ${report.manifestHash}`);
    console.log(`   Circuits: ${REQUIRED_CIRCUITS.join(', ')}`);
    return;
  }

  console.error('❌ Compact artifact verification failed:');
  for (const error of report.errors) console.error(`  - ${error}`);
}
