import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { EXPECTED_TOOLCHAIN, REQUIRED_CIRCUITS, sha256, verifyArtifacts, printArtifactReport } from './lib/artifact-integrity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const contractPath = path.resolve(rootDir, 'src/contracts/horizon.compact');
const outputPath = path.resolve(rootDir, 'src/contracts/compiled');
const clientPath = path.resolve(rootDir, 'src/services/midnightProtocolClient.ts');

const fullKeyGeneration = process.argv.includes('--full');
const checkOnly = process.argv.includes('--check');
const updateClientHash = process.argv.includes('--update-client-hash');

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (fullKeyGeneration && checkOnly) {
  fail('❌ Choose either --full or --check, not both.');
}
if (updateClientHash && !fullKeyGeneration) {
  fail('❌ --update-client-hash requires --full.');
}
if (!fs.existsSync(contractPath)) {
  fail(`❌ ERROR: Compact contract file not found at ${contractPath}`);
}

console.log('\n====================================================================');
console.log('🌌 HORIZON PROTOCOL: MIDNIGHT COMPACT CONTRACT COMPILER');
console.log('====================================================================');
console.log(`Target Contract: ${contractPath}`);
console.log(`Output Directory: ${outputPath}`);
console.log(`Mode: ${fullKeyGeneration ? 'full key regeneration' : 'source/binding check (--skip-zk)'}`);

// compactc clears its output directory. Compile into a temporary directory so a
// check never touches committed artifacts and a full build can be validated
// before replacing keys.
const tempOutputPath = fs.mkdtempSync(path.join(os.tmpdir(), 'horizon-compact-'));
fs.mkdirSync(outputPath, { recursive: true });

/** Finds the exact pinned compactc version on native Windows. */
function findNativeWindowsCompactc() {
  const home = process.env.USERPROFILE || process.env.HOME || '';
  if (!home) return '';
  const pinned = path.join(home, '.compact', 'versions', EXPECTED_TOOLCHAIN.compilerVersion, 'compactc.exe');
  return fs.existsSync(pinned) ? pinned : '';
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
  if (converted.status === 0 && converted.stdout.trim()) candidates.push(converted.stdout.trim());

  const normalized = windowsPath.replace(/\\/g, '/');
  const driveMatch = normalized.match(/^([A-Za-z]):\/(.*)$/);
  if (driveMatch) {
    const drive = driveMatch[1].toLowerCase();
    candidates.push(`/mnt/host/${drive}/${driveMatch[2]}`);
    candidates.push(`/mnt/${drive}/${driveMatch[2]}`);
  }
  return candidates.find(wslPathExists) ?? normalized;
}

function checkVersion(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.error || result.status !== 0) {
    fail(`❌ Unable to check compactc version: ${result.error?.message || output.trim()}`);
  }
  if (!output.includes(EXPECTED_TOOLCHAIN.compilerVersion)) {
    fail(
      `❌ Expected compactc ${EXPECTED_TOOLCHAIN.compilerVersion}; got: ${output.trim()}. ` +
        `Install the pinned toolchain or set COMPACTC_BIN to the correct binary.`
    );
  }
  console.log(`Verified compactc ${EXPECTED_TOOLCHAIN.compilerVersion}.`);
}

const compilerFlags = fullKeyGeneration ? [] : ['--skip-zk'];
let compileCommand;
let compileArgs;
let versionCommand;
let versionArgs;

if (process.platform === 'win32') {
  const localBinary = process.env.COMPACTC_BIN || findNativeWindowsCompactc();
  if (localBinary && fs.existsSync(localBinary)) {
    compileCommand = localBinary;
    compileArgs = [...compilerFlags, contractPath, tempOutputPath];
    versionCommand = localBinary;
    versionArgs = ['--version'];
  } else {
    const pinnedProbe = spawnSync(
      'wsl',
      ['sh', '-c', `find "$HOME"/.compact/versions/${shellQuote(EXPECTED_TOOLCHAIN.compilerVersion)} -type f -name compactc.bin -print -quit 2>/dev/null`],
      { encoding: 'utf8' }
    );
    const wslBinary = pinnedProbe.stdout.trim();
    if (!wslBinary) {
      fail(
        `❌ compactc ${EXPECTED_TOOLCHAIN.compilerVersion} not found. Install the pinned toolchain or set COMPACTC_BIN.`
      );
    }
    const wslContract = toWslPath(contractPath);
    const wslOutput = toWslPath(tempOutputPath);
    const binaryDir = path.posix.dirname(wslBinary);
    const envPrefix = `PATH=${shellQuote(binaryDir)}:$PATH COMPACT_PATH=${shellQuote(binaryDir)}`;
    versionCommand = 'wsl';
    versionArgs = ['sh', '-c', `${envPrefix} ${shellQuote(wslBinary)} --version`];
    compileCommand = 'wsl';
    compileArgs = [
      'sh',
      '-c',
      [
        'mkdir -p /root/.cache 2>/dev/null || true',
        'mount -t tmpfs tmpfs /tmp 2>/dev/null || true',
        'mount -t tmpfs tmpfs /root/.cache 2>/dev/null || true',
        `binaryDir=${shellQuote(binaryDir)}`,
        `PATH="$binaryDir:$PATH" COMPACT_PATH="$binaryDir" ${shellQuote(wslBinary)} ${compilerFlags.join(' ')} ${shellQuote(wslContract)} ${shellQuote(wslOutput)}`,
      ].join('; '),
    ];
  }
} else {
  const compactCli = spawnSync('compact', ['--version'], { encoding: 'utf8' });
  // Prefer the versioned toolchain manager. Newer Compact CLI releases ship a
  // `~/.compact/bin/compactc` wrapper that is not always directly runnable,
  // while `compact compile +<version>` resolves the pinned binary reliably.
  if (!process.env.COMPACTC_BIN && !compactCli.error && compactCli.status === 0) {
    compileCommand = 'compact';
    compileArgs = [
      'compile',
      `+${EXPECTED_TOOLCHAIN.compilerVersion}`,
      ...compilerFlags,
      contractPath,
      tempOutputPath,
    ];
    versionCommand = 'compact';
    versionArgs = ['compile', `+${EXPECTED_TOOLCHAIN.compilerVersion}`, '--version'];
  } else {
    compileCommand = process.env.COMPACTC_BIN || 'compactc';
    compileArgs = [...compilerFlags, contractPath, tempOutputPath];
    versionCommand = compileCommand;
    versionArgs = ['--version'];
  }
}

checkVersion(versionCommand, versionArgs);

console.log(`Using compactc: ${compileCommand}\n`);
const result = spawnSync(compileCommand, compileArgs, { encoding: 'utf8' });
if (result.error) fail(`❌ Failed to invoke compactc: ${result.error.message}`);
if (result.status !== 0) {
  fail(`❌ Compilation failed:\n${result.stderr || result.stdout || `exit code ${result.status}`}`);
}

console.log('====================================================================');
console.log('✅ COMPACT CONTRACT COMPILATION SUCCESSFUL');
console.log('====================================================================');
if (result.stdout && result.stdout.trim()) console.log(result.stdout.trim());

const generatedManifestPath = path.join(tempOutputPath, 'compiler/contract-manifest.json');
if (!fs.existsSync(generatedManifestPath)) {
  fail('❌ compactc did not produce compiler/contract-manifest.json.');
}
const generatedManifest = JSON.parse(fs.readFileSync(generatedManifestPath, 'utf8'));
for (const [manifestKey, expectedKey] of [
  ['compiler-version', 'compilerVersion'],
  ['language-version', 'languageVersion'],
  ['runtime-version', 'runtimeVersion'],
]) {
  if (generatedManifest[manifestKey] !== EXPECTED_TOOLCHAIN[expectedKey]) {
    fail(
      `❌ Generated ${manifestKey} is ${generatedManifest[manifestKey] ?? 'missing'}; ` +
        `expected ${EXPECTED_TOOLCHAIN[expectedKey]}.`
    );
  }
}

// Source, bindings, manifest, and ZKIR must be reproducible. Keys are only
// compared during --full because --skip-zk intentionally omits them.
function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]));
  }
  return value;
}

function sourceCheckManifest(manifest) {
  const copy = canonicalJson(manifest);
  delete copy.keys;
  return copy;
}

const committedManifestPath = path.join(outputPath, 'compiler/contract-manifest.json');
if (!fs.existsSync(committedManifestPath)) {
  fail('❌ Committed compiler/contract-manifest.json is missing.');
}
const committedManifest = JSON.parse(fs.readFileSync(committedManifestPath, 'utf8'));
const comparableGenerated = fullKeyGeneration ? canonicalJson(generatedManifest) : sourceCheckManifest(generatedManifest);
const comparableCommitted = fullKeyGeneration ? canonicalJson(committedManifest) : sourceCheckManifest(committedManifest);
if (JSON.stringify(comparableGenerated) !== JSON.stringify(comparableCommitted)) {
  console.error('Generated manifest:', JSON.stringify(comparableGenerated, null, 2));
  console.error('Committed manifest:', JSON.stringify(comparableCommitted, null, 2));
  fail('❌ compiler/contract-manifest.json does not match committed output. Recompile with --full and review the diff.');
}

const comparedFiles = [
  'compiler/contract-manifest.json',
  'compiler/contract-info.json',
  'contract/index.js',
  'contract/index.d.ts',
  'contract/index.js.map',
];
const zkirDir = path.join(tempOutputPath, 'zkir');
if (fs.existsSync(zkirDir)) {
  for (const file of fs.readdirSync(zkirDir)) comparedFiles.push(`zkir/${file}`);
}

for (const relative of comparedFiles) {
  const generated = path.join(tempOutputPath, relative);
  if (!fs.existsSync(generated)) continue;
  const committed = path.join(outputPath, relative);
  if (!fs.existsSync(committed)) {
    fail(`❌ Generated artifact ${relative} is missing from the committed compiled directory.`);
  }
  const generatedHash = sha256(fs.readFileSync(generated));
  const committedHash = sha256(fs.readFileSync(committed));
  if (generatedHash !== committedHash) {
    fail(`❌ ${relative} does not match committed output. Recompile with --full and review the diff.`);
  }
}

if (fullKeyGeneration) {
  const missingKeys = REQUIRED_CIRCUITS.flatMap((circuit) => [
    `keys/${circuit}.prover`,
    `keys/${circuit}.verifier`,
  ]).filter((relative) => !fs.existsSync(path.join(tempOutputPath, relative)));
  if (missingKeys.length > 0) {
    fail(`❌ Full key generation is incomplete. Missing:\n  ${missingKeys.join('\n  ')}`);
  }
}

function mergeDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) mergeDirectory(from, to);
    else fs.copyFileSync(from, to);
  }
}

if (fullKeyGeneration) {
  mergeDirectory(tempOutputPath, outputPath);
  console.log(`\nMerged complete compiler output into ${path.relative(rootDir, outputPath)}.`);
} else {
  console.log('\nℹ️  Source, bindings, manifest, and ZKIR match committed artifacts. No files changed.');
}
fs.rmSync(tempOutputPath, { recursive: true, force: true });

const report = verifyArtifacts();
printArtifactReport(report);
if (!report.ok) process.exit(1);

const clientSource = fs.readFileSync(clientPath, 'utf8');
const pinnedMatch = clientSource.match(/EXPECTED_MANIFEST_HASH\s*=\s*'([0-9a-f]{64})'/);
if (!pinnedMatch) {
  fail('❌ Could not find EXPECTED_MANIFEST_HASH in src/services/midnightProtocolClient.ts.');
}
if (pinnedMatch[1] !== report.manifestHash) {
  if (updateClientHash) {
    fs.writeFileSync(
      clientPath,
      clientSource.replace(/EXPECTED_MANIFEST_HASH\s*=\s*'[0-9a-f]{64}'/, `EXPECTED_MANIFEST_HASH = '${report.manifestHash}'`)
    );
    console.log(`Updated pinned manifest hash to ${report.manifestHash}.`);
  } else {
    fail(
      `❌ Pinned client manifest hash ${pinnedMatch[1]} does not match ${report.manifestHash}. ` +
        'Review the artifact diff, then rerun with --update-client-hash.'
    );
  }
}
