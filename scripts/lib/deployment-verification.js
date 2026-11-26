/**
 * Shared deployment verification logic.
 *
 * Preferred source: the official authenticated Midnight Indexer GraphQL API.
 * Fallback source: the public Midnight Explorer REST API, which is suitable
 * for checks but should not be treated as a production SLA.
 */

export function normalizeHex(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^0x/i, '').toLowerCase();
}

export function sameHex(left, right) {
  const normalizedLeft = normalizeHex(left);
  const normalizedRight = normalizeHex(right);
  return normalizedLeft.length > 0 && normalizedLeft === normalizedRight;
}

async function fetchJson(fetchImpl, url, options = {}) {
  const response = await fetchImpl(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${new URL(url).origin}`);
  }
  return response.json();
}

function containsHexString(value, expected, seen = new Set()) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return sameHex(value, expected);
  if (typeof value !== 'object' || seen.has(value)) return false;
  seen.add(value);
  return Object.values(value).some((entry) => containsHexString(entry, expected, seen));
}

export async function verifyDeploymentClaim({
  indexer,
  contractAddress,
  deployTxHash,
  graphqlUrl,
  projectId,
  fetchImpl = fetch,
}) {
  if (!contractAddress || !deployTxHash) {
    throw new Error('Both a contract address and deploy transaction hash are required.');
  }

  if (graphqlUrl && projectId) {
    const query = `
      query VerifyHorizonDeployment($address: HexEncoded!, $txHash: HexEncoded!) {
        contract(address: $address) {
          address
        }
        transactions(offset: { hash: $txHash }) {
          hash
          block {
            height
          }
        }
        contractAction(
          address: $address
          offset: { transactionOffset: { hash: $txHash } }
        ) {
          address
          transaction {
            hash
          }
        }
      }
    `;
    const json = await fetchJson(fetchImpl, graphqlUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        project_id: projectId,
      },
      body: JSON.stringify({ query, variables: { address: contractAddress, txHash: deployTxHash } }),
    });
    if (Array.isArray(json.errors) && json.errors.length > 0) {
      throw new Error(json.errors.map((error) => error.message).join('; '));
    }

    const tx = (json.data?.transactions || []).find((entry) => sameHex(entry?.hash, deployTxHash));
    const action = json.data?.contractAction;
    return {
      source: 'indexer-graphql',
      contractFoundOnChain: sameHex(json.data?.contract?.address, contractAddress),
      transactionFoundOnChain: Boolean(tx),
      contractDeployedByTransaction:
        sameHex(action?.address, contractAddress) && sameHex(action?.transaction?.hash, deployTxHash),
      blockHeight: tx?.block?.height ?? null,
    };
  }

  const base = indexer.replace(/\/$/, '');
  const txJson = await fetchJson(fetchImpl, `${base}/transactions/${encodeURIComponent(deployTxHash)}`);
  const txData = txJson.data;
  const transactionFoundOnChain = sameHex(txData?.hash, deployTxHash);

  let contractFoundOnChain = false;
  try {
    const contractJson = await fetchJson(
      fetchImpl,
      `${base}/contracts/${encodeURIComponent(contractAddress)}`
    );
    const items = contractJson.data?.items || [];
    contractFoundOnChain = items.some((item) => sameHex(item?.address, contractAddress));
  } catch {
    // Some explorer versions do not expose a contract lookup endpoint. The
    // transaction's contractActions are checked below as a second source.
  }

  const contractDeployedByTransaction =
    transactionFoundOnChain &&
    containsHexString(txData?.contractActions, contractAddress);

  return {
    source: 'explorer-rest',
    contractFoundOnChain,
    transactionFoundOnChain,
    contractDeployedByTransaction,
    blockHeight: txData?.blockHeight ?? null,
  };
}
