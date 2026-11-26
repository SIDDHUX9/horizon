import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const contractPath = path.resolve(rootDir, 'src/contracts/horizon.compact');
const outputPath = path.resolve(rootDir, 'src/contracts/compiled');

function fail(message) {
  console.error(message);
  process.exit(1);
}

console.log('\n====================================================================');
console.log('🌌 HORIZON PROTOCOL: MIDNIGHT COMPACT CONTRACT COMPILER');
console.log('====================================================================');
console.log(`Target Contract: ${contractPath}`);
console.log(`Output Directory: ${outputPath}`);

if (!fs.existsSync(contractPath)) {
  fail(`❌ ERROR: Compact contract file not found at ${contractPath}`);
}

// compactc clears its output directory. Compile into a temporary directory and
// merge the result so committed prover/verifier keys are never destroyed.
const tempOutputPath = fs.mkdtempSync(path.join(os.tmpdir(), 'horizon-compact-'));
fs.mkdirSync(outputPath, { recursive: true });

/**
 * Resolve compactc without hardcoding a developer's home directory.
 * Priority: COMPACTC_BIN env var -> compactc on PATH -> installed ~/.compact version.
 */
function findNativeWindowsCompactc() {
  const home = process.env.USERPROFILE || process.env.HOME || '';
  if (!home) return '';
  const versions = path.join(home, '.compact', 'versions');
  if (!fs.existsSync(versions)) return '';
  const dirs = fs.readdirSync(versions).filter((d) => /^\d+\.\d+\.\d+$/.test(d)).sort().reverse();
  for (const version of dirs) {
    const candidate = path.join(versions, version, 'compactc.exe');
    if (fs.existsSync(candidate)) return candidate;
  }
  return '';
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function wslPathExists(wslPath) {
  const probe = spawnSync('wsl', ['sh', '-c', `test -e ${shellQuote(wslPath)}`], { encoding: 'utf8' });
  return probe.status === 0;
}

function toWslPath(windowsPath) {
  const candidates = [];

  const converted = spawnSync('wsl', ['wslpath', '-u', windowsPath], { encoding: 'utf8' });
  if (converted.status === 0 && converted.stdout.trim()) {
    candidates.push(converted.stdout.trim());
  }

  const normalized = windowsPath.replace(/\\/g, '/');
  const driveMatch = normalized.match(/^([A-Za-z]):\/(.*)$/);
  if (driveMatch) {
    const drive = driveMatch[1].toLowerCase();
    const rest = driveMatch[2];
    candidates.push(`/mnt/host/${drive}/${rest}`);
    candidates.push(`/mnt/${drive}/${rest}`);
  }

  const found = candidates.find(wslPathExists);
  return found ?? normalized;
}

let result;
if (process.platform === 'win32') {
  const localBinary = process.env.COMPACTC_BIN || findNativeWindowsCompactc();
  if (localBinary && fs.existsSync(localBinary)) {
    // Native Windows binary supplied via env var.
    console.log(`Using compactc binary: ${localBinary}\n`);
    result = spawnSync(localBinary, ['--skip-zk', contractPath, tempOutputPath], { encoding: 'utf8' });
  } else {
    // WSL toolchain: resolve the real binary + mount paths inside WSL.
    const probe = spawnSync(
      'wsl',
      ['sh', '-c', "command -v compactc.bin 2>/dev/null || find \"$HOME\"/.compact/versions -type f -name compactc.bin 2>/dev/null | sort -V | tail -n 1"],
      { encoding: 'utf8' }
    );
    const wslBinary = probe.stdout.trim();
    if (!wslBinary) {
      fail('❌ compactc not found. Install the Midnight Compact toolchain or set COMPACTC_BIN.');
    }
    const wslContract = toWslPath(contractPath);
    const wslOutput = toWslPath(tempOutputPath);
    console.log(`Using WSL compactc binary: ${wslBinary}\n`);
    // compactc writes temporary embedded targets to /tmp and $HOME/.cache.
    // On some WSL installs these are mounted noexec; remounting tmpfs keeps the
    // compiler portable without hardcoding a developer's home directory.
    const compileCommand = [
      'mkdir -p /root/.cache 2>/dev/null || true',
      'mount -t tmpfs tmpfs /tmp 2>/dev/null || true',
      'mount -t tmpfs tmpfs /root/.cache 2>/dev/null || true',
      `binaryDir=$(dirname ${shellQuote(wslBinary)})`,
      `PATH="$binaryDir:$PATH" COMPACT_PATH="$binaryDir" ${shellQuote(wslBinary)} --skip-zk ${shellQuote(wslContract)} ${shellQuote(wslOutput)}`,
    ].join('; ');
    result = spawnSync('wsl', ['sh', '-c', compileCommand], { encoding: 'utf8' });
  }
} else {
  const binary = process.env.COMPACTC_BIN || 'compactc';
  console.log(`Using compactc binary: ${binary}\n`);
  result = spawnSync(binary, ['--skip-zk', contractPath, tempOutputPath], { encoding: 'utf8' });
}

if (result.error) {
  fail(`❌ Failed to invoke compactc: ${result.error.message}`);
}
if (result.status !== 0) {
  fail(`❌ Compilation failed:\n${result.stderr || result.stdout || `exit code ${result.status}`}`);
}

console.log('====================================================================');
console.log('✅ COMPACT CONTRACT COMPILATION SUCCESSFUL');
console.log('====================================================================');
if (result.stdout && result.stdout.trim()) console.log(result.stdout.trim());

/**
 * Copy compiler output into the committed directory without deleting existing
 * artifacts. This only runs when a complete prover key set was generated.
 */
function mergeDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      mergeDirectory(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

const generatedKeysDir = path.join(tempOutputPath, 'keys');
const generatedProverKeys = fs.existsSync(generatedKeysDir)
  ? fs.readdirSync(generatedKeysDir).filter((file) => file.endsWith('.prover'))
  : [];

if (generatedProverKeys.length > 0) {
  mergeDirectory(tempOutputPath, outputPath);
  console.log(`\nMerged complete compiler output into ${path.relative(rootDir, outputPath)}.`);
} else {
  console.log('\nℹ️  Key generation was skipped (--skip-zk); committed compiled artifacts were left untouched.');
}
fs.rmSync(tempOutputPath, { recursive: true, force: true });

const keysDir = path.resolve(outputPath, 'keys');
const zkirDir = path.resolve(outputPath, 'zkir');
if (fs.existsSync(keysDir)) {
  const keys = fs.readdirSync(keysDir);
  console.log(`\nProver/Verifier Keys available (${keys.length} files):`);
  keys.forEach((k) => console.log(`  - keys/${k}`));
}
if (fs.existsSync(zkirDir)) {
  const zkir = fs.readdirSync(zkirDir);
  console.log(`\nGenerated ZKIR Circuit Defs (${zkir.length} files):`);
  zkir.forEach((z) => console.log(`  - zkir/${z}`));
}
