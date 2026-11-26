import { printArtifactReport, verifyArtifacts } from './lib/artifact-integrity.js';

const PROOF_SERVER_URL = process.env.MIDNIGHT_PROOF_SERVER || 'http://127.0.0.1:6300';

async function checkProofServer() {
  try {
    const response = await fetch(PROOF_SERVER_URL, { signal: AbortSignal.timeout(5000) });
    return { reachable: true, status: response.status };
  } catch (error) {
    return { reachable: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  console.log('====================================================================');
  console.log('HORIZON: PROOF SERVER PREFLIGHT');
  console.log(`URL: ${PROOF_SERVER_URL}`);
  console.log('====================================================================\n');

  const artifacts = verifyArtifacts();
  printArtifactReport(artifacts);

  const server = await checkProofServer();
  if (!server.reachable) {
    console.error(`\n❌ Proof server is not reachable: ${server.error}`);
    console.error('Start proof server 9.0.2 with: docker compose up -d horizon-proof-server');
    process.exit(1);
  }

  console.log(`\n✅ Proof server responded with HTTP ${server.status}.`);
  console.log('This check proves server reachability only. It does not generate a Horizon circuit proof.');
}

main().catch((error) => {
  console.error('❌ Preflight failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
