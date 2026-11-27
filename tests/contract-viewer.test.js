import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('contract viewer reads the real Compact source at build time', () => {
  const viewer = read('src/components/ContractCodeViewer.tsx');
  assert.ok(viewer.includes("import compactSource from '../contracts/horizon.compact?raw';"));
  assert.ok(!viewer.includes('const compactSource = `pragma language_version'));
  assert.ok(viewer.includes('{compactSource}'));
});
