import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROOF_SERVER_HOST = '127.0.0.1';
const PROOF_SERVER_PORT = 6300;
const PROOF_SERVER_URL = `http://${PROOF_SERVER_HOST}:${PROOF_SERVER_PORT}`;

const COMPILED_DIR = path.resolve(__dirname, '../src/contracts/compiled');
const ZKIR_PATH = path.resolve(COMPILED_DIR, 'zkir/requestLoan.bzkir');
const PROVER_KEY_PATH = path.resolve(COMPILED_DIR, 'keys/requestLoan.prover');

console.log('====================================================================');
console.log('🛡️  MIDNIGHT REAL PROOF GENERATION: requestLoan CIRCUIT');
console.log(`📡 Target Proof Server: ${PROOF_SERVER_URL}`);
console.log('====================================================================\n');

async function checkServerConnection() {
  return new Promise((resolve, reject) => {
    const req = http.get(PROOF_SERVER_URL, { timeout: 3000 }, (res) => {
      resolve(true);
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Connection to proof server timed out after 3000ms on ${PROOF_SERVER_URL}`));
    });
  });
}

async function run() {
  console.log('Step 1: Checking reachability of local proof server on port 6300...');
  try {
    await checkServerConnection();
    console.log('✅ Local proof server detected on port 6300!\n');
  } catch (err) {
    console.error('❌ FATAL ERROR: LOCAL PROOF SERVER IS NOT REACHABLE!');
    console.error('====================================================================');
    console.error(`Connection Error: ${err.message}`);
    console.error('The local proof server on Docker port 6300 is offline or not running.');
    console.error('Per your requirements, execution will NOT fall back to any simulated or mock proof path.');
    console.error('\nTo start the Midnight proof server container, please start Docker Desktop and run:');
    console.error('   docker run -d -p 6300:6300 ghcr.io/midnight-ntwrk/proof-server:latest');
    console.error('====================================================================\n');
    process.exit(1);
  }

  // Check circuit files
  if (!fs.existsSync(ZKIR_PATH)) {
    console.error(`❌ ZKIR file missing at ${ZKIR_PATH}. Run 'npm run compile:compact' first.`);
    process.exit(1);
  }
  if (!fs.existsSync(PROVER_KEY_PATH)) {
    console.error(`❌ Prover key missing at ${PROVER_KEY_PATH}. Run 'npm run compile:compact' first.`);
    process.exit(1);
  }

  const zkirBuffer = fs.readFileSync(ZKIR_PATH);
  const proverKeyBuffer = fs.readFileSync(PROVER_KEY_PATH);

  console.log(`Step 2: Loaded real compiled circuit artifacts:`);
  console.log(`  - ZKIR: ${ZKIR_PATH} (${zkirBuffer.length} bytes)`);
  console.log(`  - Prover Key: ${PROVER_KEY_PATH} (${proverKeyBuffer.length} bytes)`);

  // Prepare proof request payload with real inequality witness data
  const witnessInput = {
    circuit: 'requestLoan',
    publicInputs: {
      pool_id: '0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20',
      borrower: '0x7a31f9820000000000000000000000000000000000000000000000000000f982',
      requested_amount: '5000000000', // 5,000 NIGHT
      collateral_deposit: '7500000000', // 7,500 NIGHT (150% ratio)
      min_income: '50000000000', // 50k floor
      max_debt_to_income_bps: 4000, // 40%
      min_collateral_ratio_bps: 15000 // 150%
    },
    privateWitness: {
      actual_income: '85000000000', // 85k (≥ 50k floor)
      existing_debt: '15000000000', // 15k
      computed_dti_ratio: 1764, // 17.64% (≤ 40% ceiling)
      computed_collateral_ratio: 15000 // 150% (≥ 150% minimum)
    }
  };

  const payload = JSON.stringify({
    zkir: zkirBuffer.toString('base64'),
    proverKey: proverKeyBuffer.toString('base64'),
    inputs: witnessInput
  });

  console.log('\nStep 3: Submitting request to proof server at http://127.0.0.1:6300/prove...');
  const startTime = Date.now();

  const options = {
    hostname: PROOF_SERVER_HOST,
    port: PROOF_SERVER_PORT,
    path: '/prove',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const proofRequest = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const elapsedMs = Date.now() - startTime;
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const responseJson = JSON.parse(data);
        console.log('\n====================================================================');
        console.log('✅ REAL ZERO-KNOWLEDGE PROOF GENERATED SUCCESSFULLY!');
        console.log('====================================================================');
        console.log(`⏱️  Proof Generation Time: ${elapsedMs} ms (${(elapsedMs / 1000).toFixed(2)}s)`);
        console.log(`📦 Proof Size: ${Buffer.byteLength(data)} bytes`);
        console.log(`🔑 Proof Hash / ID: ${responseJson.proofHash || responseJson.id || 'ZK-PROOF-OK'}`);
        console.log('====================================================================\n');
      } else {
        console.error(`❌ Proof server returned error status ${res.statusCode}:`);
        console.error(data);
        process.exit(1);
      }
    });
  });

  proofRequest.on('error', (err) => {
    console.error(`❌ Failed during proof generation request: ${err.message}`);
    process.exit(1);
  });

  proofRequest.write(payload);
  proofRequest.end();
}

run();
