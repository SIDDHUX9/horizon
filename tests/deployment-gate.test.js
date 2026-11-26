import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const recordPath = path.resolve(dir, '../src/contracts/deployed-contract.json');
const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));

test('canonical record is honest about deployment status', () => {
  assert.equal(record.deploymentStatus, 'not-deployed');
  assert.equal(record.verifiedOnChain, false);
  assert.equal(record.contractAddress, null);
  assert.equal(record.deployTxHash, null);
});

test('deployment gate requires all on-chain findings including deploy linkage', () => {
  const source = fs.readFileSync(path.resolve(dir, '../src/services/deploymentGate.ts'), 'utf8');
  assert.match(source, /record\.verification\.contractFoundOnChain !== true/);
  assert.match(source, /record\.verification\.transactionFoundOnChain !== true/);
  assert.match(source, /record\.verification\.contractDeployedByTransaction !== true/);
});

test('dev API cannot mutate the canonical deployment record', () => {
  const plugin = fs.readFileSync(path.resolve(dir, '../scripts/vite-midnight-plugin.js'), 'utf8');
  assert.equal(plugin.includes('writeFileSync(deployedConfigPath'), false);
  assert.match(plugin, /record-deployment.*501/s);
});

test('record never contains the retracted fake hashes', () => {
  const serialized = JSON.stringify(record).toLowerCase();
  const retracted = [
    '0x9f32540f9f75d91dd1353deae6419b6c531ebff2428bb3567edcfccb580541ee',
    '0x4b11e7924f3a8063da27c49093c432a8c7a3ed26cb29ea8bce009b4ec54cee26',
    '0x930ab57c0e90799b6d6e4ae9a0ff7650b80541d49969377b0ed1334dd321faa1',
  ];
  for (const hash of retracted) {
    assert.equal(serialized.includes(hash.replace(/^0x/, '')), false);
  }
});
