import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('CI verifies compiler reproducibility, built artifacts, and deployment evidence', () => {
  const workflow = read('.github/workflows/ci.yml');
  assert.ok(workflow.includes('compact update 0.36.1'));
  assert.ok(workflow.includes('npm run compile:compact -- --check'));
  assert.ok(workflow.includes('npm run verify:build'));
  assert.ok(workflow.includes('npm run check:release'));

  const pkg = JSON.parse(read('package.json'));
  assert.ok(pkg.scripts['verify:build']);
  assert.ok(pkg.scripts['check:release']);
  assert.ok(pkg.scripts.ci.includes('verify:build'));
  assert.ok(pkg.scripts.ci.includes('check:release'));
});

test('release gate refuses unsupported deployment claims', () => {
  const gate = read('scripts/check-release-gate.js');
  for (const field of [
    'contractFoundOnChain',
    'transactionFoundOnChain',
    'contractDeployedByTransaction',
  ]) {
    assert.ok(gate.includes(field), `missing evidence check for ${field}`);
  }
  assert.ok(gate.includes('claimedContractAddress'));
  assert.ok(gate.includes('claimedDeployTxHash'));
  assert.ok(gate.includes("evidence.source === 'not-checked'"));
});

test('artifact verifier can check a copied build output directory', () => {
  const verifier = read('scripts/lib/artifact-integrity.js');
  const buildScript = read('scripts/verify-build-artifacts.js');
  assert.ok(verifier.includes('export function verifyArtifacts(compiledDir = COMPILED_DIR)'));
  assert.ok(buildScript.includes('verifyArtifacts(distContracts)'));
  assert.ok(buildScript.includes('EXPECTED_MANIFEST_HASH'));
});

test('reviewers can regenerate pinned artifacts in a clean Linux runner', () => {
  const workflow = read('.github/workflows/regenerate-compact.yml');
  assert.ok(workflow.includes('workflow_dispatch:'));
  assert.ok(workflow.includes('compact update 0.36.1'));
  assert.ok(workflow.includes('npm run compile:compact -- --full --update-client-hash'));
  assert.ok(workflow.includes('npm run verify:build'));
  assert.ok(workflow.includes('upload-artifact@v4'));
});
