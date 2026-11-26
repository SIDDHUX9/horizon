import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('browser indexer endpoint is configurable per network', () => {
  const source = read('src/services/midnightLiveIndexer.ts');
  assert.match(source, /import\.meta\.env\.VITE_INDEXER_URL/);
  assert.match(source, /preview-service-v2-01\.midnightexplorer\.com\/api\/v1/);
  assert.ok(source.includes(".replace(/\\/$/, '')"));
});

test('example environment documents the public indexer override', () => {
  assert.match(read('.env.example'), /^VITE_INDEXER_URL=/m);
});

test('explorer links are centralized and network configurable', () => {
  const helper = read('src/services/explorerUrls.ts');
  assert.match(helper, /import\.meta\.env\.VITE_EXPLORER_URL/);
  for (const file of [
    'src/components/BorrowerStudio.tsx',
    'src/components/WhitepaperPage.tsx',
    'src/components/TransparencyExplorer.tsx',
    'src/services/horizonDeployer.ts',
  ]) {
    assert.equal(read(file).includes('https://preview.midnightexplorer.com'), false);
  }
  assert.match(read('.env.example'), /^VITE_EXPLORER_URL=/m);
});
