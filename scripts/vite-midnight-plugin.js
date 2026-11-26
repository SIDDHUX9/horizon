import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { HttpProverClient } from '@midnight-ntwrk/wallet-sdk-prover-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const keysDir = path.resolve(rootDir, 'src/contracts/compiled/keys');
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
    Array.isArray(addressMatches) && addressMatches.length > 0 &&
    Array.isArray(txMatches) && txMatches.length > 0;

  return {
    verifiedOnChain,
    contractFoundOnChain: Array.isArray(addressMatches) && addressMatches.length > 0,
    transactionFoundOnChain: Array.isArray(txMatches) && txMatches.length > 0,
    checkedAt: new Date().toISOString(),
    indexer: INDEXER_URL,
  };
}

export function midnightDeployPlugin() {
  return {
    name: 'vite-midnight-deploy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/midnight/status' && req.method === 'GET') {
          let proofServerOnline = false;
          try {
            const prover = new HttpProverClient({ url: new URL(PROOF_SERVER_URL) });
            // quick ping
            const testCost = ledger.CostModel.initialCostModel();
            const testTx = ledger.Transaction.fromParts(NETWORK_ID, undefined, undefined, undefined);
            await prover.proveTransaction(testTx, testCost);
            proofServerOnline = true;
          } catch {
            proofServerOnline = false;
          }

          let deployedContract = null;
          if (fs.existsSync(deployedConfigPath)) {
            try {
              deployedContract = JSON.parse(fs.readFileSync(deployedConfigPath, 'utf8'));
            } catch {}
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            proofServerOnline,
            proofServerUrl: PROOF_SERVER_URL,
            networkId: NETWORK_ID,
            deployedContract,
          }));
          return;
        }

        if (req.url === '/api/midnight/prepare-deploy' && req.method === 'POST') {
          try {
            const circuits = [
              'createLendingPool',
              'submitFinancialSnapshot',
              'requestLoan',
              'repayLoan',
              'liquidate'
            ];

            const cs = new ledger.ContractState();
            for (const c of circuits) {
              const vkPath = path.join(keysDir, `${c}.verifier`);
              if (!fs.existsSync(vkPath)) {
                throw new Error(`Verifier key for ${c} missing at ${vkPath}`);
              }
              const vk = fs.readFileSync(vkPath);
              const op = new ledger.ContractOperation();
              op.verifierKey = new Uint8Array(vk);
              cs.setOperation(c, op);
            }

            const deploy = new ledger.ContractDeploy(cs);
            const ttl = new Date(Date.now() + 3600 * 1000);
            const intent = ledger.Intent.new(ttl).addDeploy(deploy);
            const unprovenTx = ledger.Transaction.fromParts(NETWORK_ID, undefined, undefined, intent);

            const prover = new HttpProverClient({ url: new URL(PROOF_SERVER_URL) });
            const costModel = ledger.CostModel.initialCostModel();
            const provenTx = await prover.proveTransaction(unprovenTx, costModel);
            const boundTx = provenTx.bind();
            const zkProofHash = boundTx.transactionHash();
            const unsealedTxHex = Buffer.from(provenTx.serialize()).toString('hex');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              contractAddress: `0x${deploy.address}`,
              rawContractAddress: deploy.address,
              unsealedTxHex,
              zkProofHash: `0x${zkProofHash}`,
              circuits,
              networkId: NETWORK_ID,
            }));
          } catch (err) {
            console.error('Error preparing deploy transaction:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: err.message || 'Failed to prepare contract deployment transaction'
            }));
          }
          return;
        }

        if (req.url === '/api/midnight/record-deployment' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              if (!data.contractAddress || !data.deployTxHash) {
                throw new Error('contractAddress and deployTxHash are required');
              }

              const verification = await verifyDeploymentOnChain(data.contractAddress, data.deployTxHash);
              const record = {
                network: NETWORK_ID,
                deploymentStatus: verification.verifiedOnChain ? 'confirmed' : 'pending-verification',
                verifiedOnChain: verification.verifiedOnChain,
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
                  'liquidate'
                ],
                verification,
                explorerUrl: `https://preview.midnightexplorer.com/transactions/${data.deployTxHash}`,
                contractExplorerUrl: `https://preview.midnightexplorer.com/contracts/${data.contractAddress}`
              };

              if (verification.verifiedOnChain) {
                fs.writeFileSync(deployedConfigPath, JSON.stringify(record, null, 2));
                console.log('✅ Verified on-chain deployment recorded to:', deployedConfigPath);
              } else {
                console.warn('⚠️  Broadcast not confirmed on the indexer; canonical record was not overwritten.');
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, record, verifiedOnChain: verification.verifiedOnChain }));
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
    }
  };
}
