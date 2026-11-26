import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyArtifacts, EXPECTED_TOOLCHAIN, REQUIRED_CIRCUITS } from '../scripts/lib/artifact-integrity.js';

test('compiled artifacts match the compactc 0.36.1 manifest', () => {
  const report = verifyArtifacts();
  assert.equal(report.ok, true, report.errors.join('\n'));
  assert.equal(report.manifest['compiler-version'], EXPECTED_TOOLCHAIN.compilerVersion);
  assert.equal(report.manifest['runtime-version'], EXPECTED_TOOLCHAIN.runtimeVersion);
  assert.equal(REQUIRED_CIRCUITS.length, 5);
});

test('expected manifest hash is pinned in the browser client', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const clientSource = fs.readFileSync(
    path.resolve(dir, '../src/services/midnightProtocolClient.ts'),
    'utf8'
  );
  const report = verifyArtifacts();
  assert.ok(
    clientSource.includes(report.manifestHash),
    'midnightProtocolClient.ts must pin the current manifest hash'
  );
});
