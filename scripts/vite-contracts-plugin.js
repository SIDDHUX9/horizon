import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPILED_DIR = path.resolve(__dirname, '../src/contracts/compiled');
const DIST_CONTRACTS = path.resolve(__dirname, '../dist/contracts');

const CONTENT_TYPES = {
  '.json': 'application/json',
  '.js': 'text/javascript',
  '.map': 'application/json',
  '.prover': 'application/octet-stream',
  '.verifier': 'application/octet-stream',
  '.bzkir': 'application/octet-stream',
  '.zkir': 'application/octet-stream',
};

function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

/**
 * Serves compiled Compact artifacts at /contracts/ in dev and copies them
 * into dist/contracts/ at build time. This keeps the 24 MB key set out of
 * the source tree duplicate while letting FetchZkConfigProvider load it
 * over HTTP in both environments.
 */
export function midnightContractsPlugin() {
  return {
    name: 'vite-midnight-contracts',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/contracts/')) return next();

        const relative = decodeURIComponent(req.url.slice('/contracts/'.length).split('?')[0]);
        const file = path.resolve(COMPILED_DIR, relative);
        if (!file.startsWith(COMPILED_DIR + path.sep) && file !== COMPILED_DIR) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Forbidden');
          return;
        }
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Not found');
          return;
        }

        res.setHeader('Content-Type', CONTENT_TYPES[path.extname(file)] || 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      if (fs.existsSync(COMPILED_DIR)) {
        copyDirectory(COMPILED_DIR, DIST_CONTRACTS);
      }
    },
  };
}
