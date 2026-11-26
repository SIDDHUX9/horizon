import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('runtime mode defaults to production and demo is explicit opt-in', () => {
  const source = read('src/services/runtimeMode.ts');
  assert.match(source, /VITE_DEMO_MODE === 'true'/);
  assert.match(source, /hasExplicitDemoFlag\(\) \? 'demo' : 'production'/);
  assert.match(source, /params\.get\('demo'\)/);
});

test('production circuit handlers cannot silently use the simulator', () => {
  const app = read('src/App.tsx');
  const requiredAssertions = [
    'assertDemoMode(\'Demo ledger refresh\', runtimeMode)',
    'assertDemoMode(\'Simulated pool creation\', runtimeMode)',
    'assertDemoMode(\'Simulated snapshot submission\', runtimeMode)',
    'assertDemoMode(\'Simulated loan request\', runtimeMode)',
    'assertDemoMode(\'Simulated repayment\', runtimeMode)',
    'assertDemoMode(\'Simulated liquidation\', runtimeMode)',
  ];
  for (const assertion of requiredAssertions) {
    assert.ok(app.includes(assertion), `missing production guard: ${assertion}`);
  }
  assert.ok(app.includes('runtimeMode === \'demo\' ? horizon.getPools() : []'));
  assert.ok(app.includes('runtimeMode === \'demo\' ? horizon.getLoans() : []'));
});

test('production client connection is deployment-gated and password-protected', () => {
  const app = read('src/App.tsx');
  assert.ok(app.includes('isDeploymentVerified(canonicalNetwork)'));
  assert.ok(app.includes('MidnightProtocolClient.connect('));
  assert.ok(app.includes('privateStatePasswordProvider:'));
  assert.ok(app.includes('<PrivateStatePasswordModal'));
  assert.ok(app.includes('<ProtocolOfflinePanel'));
});
