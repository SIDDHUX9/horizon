import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { midnightDeployPlugin } from './scripts/vite-midnight-plugin.js';
import { midnightContractsPlugin } from './scripts/vite-contracts-plugin.js';

export default defineConfig({
  plugins: [react(), midnightDeployPlugin(), midnightContractsPlugin()],
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

