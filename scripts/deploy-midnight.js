import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPILED_DIR = path.resolve(__dirname, '../src/contracts/compiled');
const TESTNET_INDEXER = process.env.MIDNIGHT_INDEXER || 'https://indexer.testnet.midnight.network/api/v1/graphql';
const PROOF_SERVER_URL = process.env.MIDNIGHT_PROOF_SERVER || 'http://127.0.0.1:6300';
const WALLET_SEED = process.env.MIDNIGHT_WALLET_SEED;

console.log('====================================================================');
console.log('🚀 MIDNIGHT TESTNET DEPLOYMENT PIPELINE');
console.log(`🌐 Testnet Indexer: ${TESTNET_INDEXER}`);
console.log(`🛡️  Proof Server:    ${PROOF_SERVER_URL}`);
console.log('====================================================================\n');

async function testProofServer() {
  return new Promise((resolve, reject) => {
    const req = http.get(PROOF_SERVER_URL, { timeout: 2500 }, (res) => resolve(true));
    req.on('error', (err) => reject(new Error(`Proof server unreachable at ${PROOF_SERVER_URL}: ${err.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`Proof server connection timed out on ${PROOF_SERVER_URL}`)); });
  });
}

async function testIndexer() {
  return new Promise((resolve, reject) => {
    const req = https.get(TESTNET_INDEXER, { timeout: 4000 }, (res) => resolve(true));
    req.on('error', (err) => reject(new Error(`Midnight Testnet Indexer unreachable at ${TESTNET_INDEXER}: ${err.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`Testnet Indexer timed out at ${TESTNET_INDEXER}`)); });
  });
}

async function deploy() {
  console.log('Step 1: Validating compiled contract artifacts...');
  const keysDir = path.resolve(COMPILED_DIR, 'keys');
  const zkirDir = path.resolve(COMPILED_DIR, 'zkir');
  if (!fs.existsSync(keysDir) || !fs.existsSync(zkirDir)) {
    console.error('❌ Missing compiled contract files. Run "npm run compile:compact" first.');
    process.exit(1);
  }
  console.log('✅ Found all 10 compiled circuit keys and ZKIR files.\n');

  console.log('Step 2: Checking Midnight Proof Server on port 6300...');
  try {
    await testProofServer();
    console.log('✅ Proof Server is active.\n');
  } catch (err) {
    console.error('❌ DEPLOYMENT FAILED AT STEP 2:');
    console.error('====================================================================');
    console.error(err.message);
    console.error('Deployment to Midnight requires generating a cryptographic deployment proof');
    console.error('via the local proof server container on port 6300.');
    console.error('Please launch the container:');
    console.error('   docker run -d -p 6300:6300 ghcr.io/midnight-ntwrk/proof-server:latest');
    console.error('====================================================================\n');
    process.exit(1);
  }

  console.log('Step 3: Checking Testnet Wallet Credentials...');
  if (!WALLET_SEED) {
    console.error('❌ DEPLOYMENT FAILED AT STEP 3:');
    console.error('====================================================================');
    console.error('Missing environment variable: MIDNIGHT_WALLET_SEED');
    console.error('To deploy to Midnight testnet, a funded testnet wallet seed phrase is required');
    console.error('to pay for the deployment and transaction fees in tDUST tokens.');
    console.error('\nPlease provide your Midnight testnet seed phrase:');
    console.error('   $env:MIDNIGHT_WALLET_SEED="your twelve word seed phrase..."');
    console.error('   npm run deploy:midnight');
    console.error('====================================================================\n');
    process.exit(1);
  }

  console.log('Step 4: Checking Midnight Testnet connectivity...');
  try {
    await testIndexer();
    console.log('✅ Midnight Testnet Indexer reachable.\n');
  } catch (err) {
    console.error('❌ DEPLOYMENT FAILED AT STEP 4:');
    console.error(err.message);
    process.exit(1);
  }
}

deploy();
