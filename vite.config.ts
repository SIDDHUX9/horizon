import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import path from 'path';
import { midnightDeployPlugin } from './scripts/vite-midnight-plugin.js';
import { midnightContractsPlugin } from './scripts/vite-contracts-plugin.js';

export default defineConfig({
  plugins: [react(), wasm(), midnightDeployPlugin(), midnightContractsPlugin()],
  build: {
    // Midnight.js 5 and ledger-v9 use top-level await around WASM initialisation.
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});

