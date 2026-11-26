import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const deployedConfigPath = path.resolve(rootDir, 'src/contracts/deployed-contract.json');
const PROOF_SERVER_URL = process.env.MIDNIGHT_PROOF_SERVER || 'http://127.0.0.1:6300';
const NETWORK_ID = process.env.MIDNIGHT_NETWORK || 'preview';

async function proofServerOnline() {
  try {
    const response = await fetch(PROOF_SERVER_URL, { signal: AbortSignal.timeout(3000) });
    return { online: true, status: response.status };
  } catch {
    return { online: false, status: null };
  }
}

/**
 * Development-only status API. This plugin never writes the canonical
 * deployment record and never fabricates a proof. Production confirmation is
 * performed by scripts/confirm-deployment.js against the indexer.
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

        if (
          (req.url === '/api/midnight/prepare-deploy' ||
            req.url === '/api/midnight/record-deployment') &&
          req.method === 'POST'
        ) {
          res.statusCode = 501;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: false,
              error:
                'Unimplemented. Deploy transactions must be proven and submitted by the wallet-backed contract client. Use npm run confirm:deployment only after an independently verified broadcast; this endpoint will not fabricate a proof or contract address.',
            })
          );
          return;
        }

        next();
      });
    },
  };
}
