import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const deployedConfigPath = path.resolve(rootDir, 'src/contracts/deployed-contract.json');
const PROOF_SERVER_URL = process.env.MIDNIGHT_PROOF_SERVER || 'http://127.0.0.1:6300';
const NETWORK_ID = process.env.MIDNIGHT_NETWORK || 'preview';
const INDEXER_URL = process.env.MIDNIGHT_INDEXER || 'https://preview-service-v2-01.midnightexplorer.com/api/v1';

async function indexerMatches(query) {
  try {
    const res = await fetch(`${INDEXER_URL}/search/graphql?q=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.data?.matches) ? json.data.matches : null;
  } catch {
    return null;
  }
}

async function verifyDeploymentOnChain(contractAddress, deployTxHash) {
  const [addressMatches, txMatches] = await Promise.all([
    indexerMatches(contractAddress),
    indexerMatches(deployTxHash),
  ]);

  const verifiedOnChain =
    Array.isArray(addressMatches) &&
    addressMatches.length > 0 &&
    Array.isArray(txMatches) &&
    txMatches.length > 0;

  return {
    verifiedOnChain,
    contractFoundOnChain: Array.isArray(addressMatches) && addressMatches.length > 0,
    transactionFoundOnChain: Array.isArray(txMatches) && txMatches.length > 0,
    checkedAt: new Date().toISOString(),
    indexer: INDEXER_URL,
  };
}

async function proofServerOnline() {
  try {
    const response = await fetch(PROOF_SERVER_URL, { signal: AbortSignal.timeout(3000) });
    return { online: true, status: response.status };
  } catch {
    return { online: false, status: null };
  }
}

/**
 * Development-only API. A static production build does not include this plugin.
 * It exposes status and indexer verification only; contract proving and
 * submission belong in the wallet-backed browser client.
 */
export function midnightDeployPlugin() {
  return {
    name: 'vite-midnight-deploy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/midnight/status' && req.method === 'GET') {
          const proof = await proofServerOnline();
          let deployedContract = null;
          if (fs.existsSync(deployedConfigPath)) {
            try {
              deployedContract = JSON.parse(fs.readFileSync(deployedConfigPath, 'utf8'));
            } catch {}
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              proofServerOnline: proof.online,
              proofServerStatus: proof.status,
              proofServerUrl: PROOF_SERVER_URL,
              networkId: NETWORK_ID,
              deployedContract,
            })
          );
          return;
        }

        if (req.url === '/api/midnight/prepare-deploy' && req.method === 'POST') {
          res.statusCode = 501;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: false,
              error:
                'Unimplemented. Deploy transactions must be proven and submitted by the wallet-backed contract client; this endpoint will not fabricate a proof or contract address.',
            })
          );
          return;
        }

        if (req.url === '/api/midnight/record-deployment' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              if (!data.contractAddress || !data.deployTxHash) {
                throw new Error('contractAddress and deployTxHash are required');
              }

              const verification = await verifyDeploymentOnChain(
                data.contractAddress,
                data.deployTxHash
              );
              if (!verification.verifiedOnChain) {
                res.statusCode = 409;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Deployment was not independently confirmed on the live indexer.',
                    verification,
                  })
                );
                return;
              }

              const record = {
                network: NETWORK_ID,
                deploymentStatus: 'confirmed',
                verifiedOnChain: true,
                contractAddress: data.contractAddress,
                deployTxHash: data.deployTxHash,
                deployerAddress: data.deployerAddress || null,
                blockHeight: data.blockHeight || null,
                blockHash: data.blockHash || null,
                timestamp: new Date().toISOString(),
                circuits: [
                  'createLendingPool',
                  'submitFinancialSnapshot',
                  'requestLoan',
                  'repayLoan',
                  'liquidate',
                ],
                verification,
                explorerUrl: `https://preview.midnightexplorer.com/transactions/${data.deployTxHash}`,
                contractExplorerUrl: `https://preview.midnightexplorer.com/contracts/${data.contractAddress}`,
              };

              fs.writeFileSync(deployedConfigPath, JSON.stringify(record, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, record, verifiedOnChain: true }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}
