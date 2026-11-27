import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const client = fs.readFileSync(
  path.join(root, 'src/services/midnightProtocolClient.ts'),
  'utf8'
);

test('fresh wallets get seeded private state before contract attachment', () => {
  assert.ok(client.includes("export const HORIZON_PRIVATE_STATE_ID = 'horizon-borrower';"));
  assert.ok(client.includes('export const EMPTY_HORIZON_PRIVATE_STATE: HorizonPrivateState = {};'));
  assert.ok(client.includes('const existing = await states.get(HORIZON_PRIVATE_STATE_ID);'));
  assert.ok(client.includes('return existing ?? EMPTY_HORIZON_PRIVATE_STATE;'));
  assert.ok(client.includes('const initialPrivateState = await resolveInitialPrivateState(states);'));
  assert.ok(client.includes('privateStateId: HORIZON_PRIVATE_STATE_ID,'));
  assert.ok(client.includes('initialPrivateState,'));
});

test('private state ids use one shared constant', () => {
  assert.equal((client.match(/'horizon-borrower'/g) || []).length, 1);
  assert.ok(client.includes('states.set(HORIZON_PRIVATE_STATE_ID, { snapshot })'));
  assert.ok(client.includes('states.get(HORIZON_PRIVATE_STATE_ID)'));
});
