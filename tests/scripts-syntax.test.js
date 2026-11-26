import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');

test('all repository scripts pass node --check', () => {
  const files = [
    ...fs.readdirSync(path.join(root, 'scripts')).filter((f) => f.endsWith('.js')).map((f) => path.join('scripts', f)),
    ...fs.readdirSync(path.join(root, 'scripts', 'lib')).filter((f) => f.endsWith('.js')).map((f) => path.join('scripts', 'lib', f)),
  ];
  for (const file of files) {
    execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' });
  }
  assert.ok(files.length >= 6);
});
