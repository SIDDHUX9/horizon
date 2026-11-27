import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const source = fs.readFileSync(path.join(root, 'scripts/compile-compact.js'), 'utf8');

test('compile script requires the pinned compiler version', () => {
  assert.match(source, /EXPECTED_TOOLCHAIN\.compilerVersion/);
  assert.match(source, /checkVersion\(versionCommand, versionArgs\)/);
  assert.match(source, /versions\/\$\{shellQuote\(EXPECTED_TOOLCHAIN\.compilerVersion\)\}/);
});

test('compile script uses the versioned Compact CLI when available', () => {
  assert.match(source, /spawnSync\('compact', \['--version'\]/);
  assert.match(source, /'compile',\s*`\+\$\{EXPECTED_TOOLCHAIN\.compilerVersion\}`/);
  assert.match(source, /versionArgs = \['compile', `\+\$\{EXPECTED_TOOLCHAIN\.compilerVersion\}`, '--version'\]/);
  assert.match(source, /COMPACTC_BIN/);
});

test('compile script maps manifest keys to pinned toolchain keys', () => {
  assert.match(source, /\['compiler-version', 'compilerVersion'\]/);
  assert.match(source, /\['language-version', 'languageVersion'\]/);
  assert.match(source, /\['runtime-version', 'runtimeVersion'\]/);
});

test('source check ignores key hashes that only full compilation generates', () => {
  assert.match(source, /function sourceCheckManifest\(manifest\)/);
  assert.match(source, /delete copy\.keys;/);
  assert.match(source, /fullKeyGeneration \? canonicalJson\(generatedManifest\) : sourceCheckManifest\(generatedManifest\)/);
});

test('compile script separates read-only checks from full key regeneration', () => {
  assert.match(source, /process\.argv\.includes\('--check'\)/);
  assert.match(source, /process\.argv\.includes\('--full'\)/);
  assert.match(source, /compilerFlags = fullKeyGeneration \? \[\] : \['--skip-zk'\]/);
  assert.match(source, /missingKeys/);
  assert.match(source, /does not match committed output/);
});

test('full regeneration refuses a stale pinned manifest hash', () => {
  assert.match(source, /pinnedMatch\[1\] !== report\.manifestHash/);
  assert.match(source, /--update-client-hash/);
});
