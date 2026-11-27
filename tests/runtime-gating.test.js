import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('production builds cannot enter demo mode; development demo is explicit opt-in', () => {
  const source = read('src/services/runtimeMode.ts');
  assert.match(source, /if \(!isDemoAllowed\(\)\) return 'production';/);
  assert.match(source, /return import\.meta\.env\.DEV;/);
  assert.match(source, /VITE_DEMO_MODE === 'true'/);
  assert.match(source, /hasExplicitDemoFlag\(\) \? 'demo' : 'production'/);
  assert.match(source, /params\.get\('demo'\)/);
});

test('production banner is non-dismissible and has no demo toggle', () => {
  const banner = read('src/components/DemoModeBanner.tsx');
  assert.ok(banner.includes('if (dismissed && demoAllowed) return null;'));
  assert.equal((banner.match(/\{demoAllowed && \(/g) || []).length, 2);
  assert.ok(banner.includes('Production build: demo simulation is disabled.'));
});

test('demo simulator is constructed only when a demo handler uses it', () => {
  const simulator = read('src/contracts/horizonSimulator.ts');
  assert.ok(simulator.includes('let simulator: HorizonProtocol | undefined;'));
  assert.ok(simulator.includes('if (!simulator) simulator = new HorizonProtocol();'));
  assert.ok(!simulator.includes('export const horizon = new HorizonProtocol();'));
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

test('verified production sessions render circuit handlers instead of the offline panel', () => {
  const app = read('src/App.tsx');
  assert.ok(
    app.includes(
      "const productionReady =\n    runtimeMode === 'production' && deploymentVerified && protocolClient !== null;"
    )
  );
  assert.ok(app.includes('productionReady ? ('));
  assert.equal((app.match(/productionReady \? \(/g) || []).length, 4);
  assert.equal((app.match(/<ProductionCircuitPanel/g) || []).length, 4);
  assert.ok(app.includes('readOnChainState()'));
});

test('explorer hides simulator rows and dev deployment controls in production', () => {
  const app = read('src/App.tsx');
  const explorer = read('src/components/TransparencyExplorer.tsx');
  assert.ok(app.includes("transactions={runtimeMode === 'demo' ? transactions : liveTransactions}"));
  for (const value of ['loans', 'pools', 'repayments']) {
    assert.ok(app.includes(`${value}={${value}}`));
  }
  assert.ok(app.includes('runtimeMode={runtimeMode}'));
  assert.ok(app.includes('deploymentVerified={deploymentVerified}'));
  assert.ok(explorer.includes("runtimeMode === 'demo' && import.meta.env.DEV"));
  assert.ok(explorer.includes('if (!showDevDeployment) return;'));
  assert.ok(explorer.includes("{showDevDeployment && ("));
  assert.equal((explorer.match(/\{showDevDeployment && \(/g) || []).length, 2);
  assert.ok(explorer.includes('Verified Contract Audit: Public vs Private'));
});
