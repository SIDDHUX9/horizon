import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeHex,
  sameHex,
  verifyDeploymentClaim,
} from '../scripts/lib/deployment-verification.js';
import { buildConfirmedRecord } from '../scripts/confirm-deployment.js';

const CONTRACT = 'a'.repeat(64);
const TX = 'b'.repeat(64);

function jsonResponse(data, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => data };
}

test('hex comparison tolerates 0x prefixes and case differences', () => {
  assert.equal(normalizeHex(`0x${CONTRACT.toUpperCase()}`), CONTRACT);
  assert.equal(sameHex(`0x${CONTRACT.toUpperCase()}`, CONTRACT), true);
  assert.equal(sameHex('', CONTRACT), false);
});

test('GraphQL verification requires deploy action linkage, not just two matches', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return jsonResponse({
      data: {
        contract: { address: `0x${CONTRACT}` },
        transactions: [
          {
            hash: `0x${TX}`,
            block: { hash: 'd'.repeat(64), height: 123, timestamp: 1790000000000 },
          },
        ],
        contractAction: {
          address: `0x${CONTRACT}`,
          transaction: { hash: `0x${TX}` },
        },
      },
    });
  };

  const result = await verifyDeploymentClaim({
    indexer: 'https://unused.example/api/v1',
    contractAddress: CONTRACT,
    deployTxHash: TX,
    graphqlUrl: 'https://indexer.example/api/v0',
    projectId: 'test-project-id',
    fetchImpl,
  });

  assert.deepEqual(result, {
    source: 'indexer-graphql',
    contractFoundOnChain: true,
    transactionFoundOnChain: true,
    contractDeployedByTransaction: true,
    blockHeight: 123,
    blockHash: 'd'.repeat(64),
    timestamp: 1790000000000,
  });
  assert.equal(calls[0].options.headers.project_id, 'test-project-id');
});

test('GraphQL verification rejects an unrelated transaction', async () => {
  const fetchImpl = async () =>
    jsonResponse({
      data: {
        contract: { address: CONTRACT },
        transactions: [{ hash: TX, block: { height: 123 } }],
        contractAction: {
          address: CONTRACT,
          transaction: { hash: 'c'.repeat(64) },
        },
      },
    });

  const result = await verifyDeploymentClaim({
    indexer: 'https://unused.example/api/v1',
    contractAddress: CONTRACT,
    deployTxHash: TX,
    graphqlUrl: 'https://indexer.example/api/v0',
    projectId: 'test-project-id',
    fetchImpl,
  });

  assert.equal(result.contractFoundOnChain, true);
  assert.equal(result.transactionFoundOnChain, true);
  assert.equal(result.contractDeployedByTransaction, false);
});

test('confirmed record is derived only from a verified claim', () => {
  const record = buildConfirmedRecord(
    { network: 'preview', circuits: ['createLendingPool'], verifiedOnChain: false },
    {
      source: 'indexer-graphql',
      blockHeight: 10,
      blockHash: 'd'.repeat(64),
      timestamp: 1790000000000,
    },
    `0x${CONTRACT}`,
    `0x${TX}`
  );

  assert.equal(record.deploymentStatus, 'confirmed');
  assert.equal(record.verifiedOnChain, true);
  assert.equal(record.contractAddress, `0x${CONTRACT}`);
  assert.equal(record.deployTxHash, `0x${TX}`);
  assert.equal(record.blockHeight, 10);
  assert.equal(record.verification.contractDeployedByTransaction, true);
  assert.deepEqual(record.circuits, ['createLendingPool']);
});

test('REST verification finds deploy linkage in transaction contractActions', async () => {
  const fetchImpl = async (url) => {
    if (url.includes('/transactions/')) {
      return jsonResponse({
        data: {
          hash: `0x${TX}`,
          blockHeight: 42,
          contractActions: [{ address: `0x${CONTRACT}` }],
        },
      });
    }
    return jsonResponse({ data: { items: [{ address: CONTRACT }] } });
  };

  const result = await verifyDeploymentClaim({
    indexer: 'https://explorer.example/api/v1/',
    contractAddress: CONTRACT,
    deployTxHash: TX,
    fetchImpl,
  });

  assert.equal(result.source, 'explorer-rest');
  assert.equal(result.contractFoundOnChain, true);
  assert.equal(result.transactionFoundOnChain, true);
  assert.equal(result.contractDeployedByTransaction, true);
  assert.equal(result.blockHeight, 42);
});
