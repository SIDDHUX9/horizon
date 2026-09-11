import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { midnightDeployPlugin } from './scripts/vite-midnight-plugin.js';

export default defineConfig({
  plugins: [react(), midnightDeployPlugin()],
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

