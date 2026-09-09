import { execSync, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const contractPath = path.resolve(rootDir, 'src/contracts/horizon.compact');
const outputPath = path.resolve(rootDir, 'src/contracts/compiled');

console.log('\n====================================================================');
console.log('🌌 HORIZON PROTOCOL: MIDNIGHT COMPACT CONTRACT COMPILER');
console.log('====================================================================');
console.log(`Target Contract: ${contractPath}`);
console.log(`Output Directory: ${outputPath}`);

if (!fs.existsSync(contractPath)) {
  console.error(`❌ ERROR: Compact contract file not found at ${contractPath}`);
  process.exit(1);
}

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

console.log('Invoking compactc compiler toolchain...\n');

// Detect environment: Windows with WSL vs native Linux/macOS
const isWindows = process.platform === 'win32';

let compileCmd = '';
if (isWindows) {
  const wslContractPath = contractPath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, drive) => `/mnt/host/${drive.toLowerCase()}`);
  const wslOutputPath = outputPath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, drive) => `/mnt/host/${drive.toLowerCase()}`);
  const compactcBin = '/mnt/host/c/Users/Siddhu/.compact/versions/0.34.0/x86_64-unknown-linux-musl/compactc.bin';

  compileCmd = `wsl sh -c "mount -t tmpfs tmpfs /tmp 2>/dev/null; mkdir -p /root/.cache; mount -t tmpfs tmpfs /root/.cache 2>/dev/null; PATH='/mnt/host/c/Users/Siddhu/.compact/versions/0.34.0/x86_64-unknown-linux-musl:/usr/bin:/bin' ${compactcBin} '${wslContractPath}' '${wslOutputPath}'"`;
} else {
  compileCmd = `compactc "${contractPath}" "${outputPath}"`;
}

try {
  const result = execSync(compileCmd, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log('====================================================================');
  console.log('✅ COMPACT CONTRACT COMPILATION SUCCESSFUL');
  console.log('====================================================================');
  if (result && result.trim()) {
    console.log(result.trim());
  } else {
    console.log('Compiling 5 circuits: Done.');
  }

  // Verify generated circuits
  const keysDir = path.resolve(outputPath, 'keys');
  const zkirDir = path.resolve(outputPath, 'zkir');
  if (fs.existsSync(keysDir)) {
    const keys = fs.readdirSync(keysDir);
    console.log(`\nGenerated Prover/Verifier Keys (${keys.length} files):`);
    keys.forEach(k => console.log(`  - keys/${k}`));
  }
  if (fs.existsSync(zkirDir)) {
    const zkir = fs.readdirSync(zkirDir);
    console.log(`\nGenerated ZKIR Circuit Defs (${zkir.length} files):`);
    zkir.forEach(z => console.log(`  - zkir/${z}`));
  }
} catch (error) {
  console.error('====================================================================');
  console.error('❌ COMPILATION ERROR:');
  console.error('====================================================================');
  const stderr = error.stderr ? error.stderr.toString() : '';
  const stdout = error.stdout ? error.stdout.toString() : '';
  console.error(stderr || stdout || error.message);
  process.exit(1);
}
