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

test('production lists are decoded from verified on-chain contract state', () => {
  assert.ok(client.includes('async readOnChainState(): Promise<HorizonOnChainState>'));
  assert.ok(client.includes('this.providers.publicDataProvider.queryContractState('));
  assert.ok(client.includes("read.contractState.deserialize({ v9: ContractState })"));
  assert.ok(client.includes('const state = ledger(decoded.data);'));
  assert.ok(client.includes('Array.from(state.pools'));
  assert.ok(client.includes('Array.from(state.loans'));
  assert.ok(client.includes('Array.from(state.repayments'));
});

test('on-chain state reader never imports the demo simulator', () => {
  assert.ok(!client.includes("from '../contracts/horizonSimulator'"));
});
