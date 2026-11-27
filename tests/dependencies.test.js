import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const declared = { ...pkg.dependencies, ...pkg.devDependencies };

const directImports = [
  ['src/services/midnightProtocolClient.ts', 'level', '10.0.0'],
  ['src/services/midnightProtocolClient.ts', '@midnight-ntwrk/midnight-js-contracts', '5.0.1'],
  ['src/services/midnightProtocolClient.ts', '@midnight-ntwrk/midnight-js-types', '5.0.1'],
  ['src/services/ids.ts', '@midnightntwrk/wallet-sdk-address-format', '4.0.1'],
];

test('browser client dependencies are declared explicitly and pinned', () => {
  for (const [file, dependency, expectedVersion] of directImports) {
    assert.ok(
      fs.readFileSync(path.join(root, file), 'utf8').includes(`from '${dependency}'`),
      `${dependency} is no longer imported by ${file}`
    );
    assert.equal(declared[dependency], expectedVersion, `${dependency} is not pinned`);
  }
});
