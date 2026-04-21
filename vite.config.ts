import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Served as an easter egg at kovalevanton.xyz/arkanoid.
  // Keep this in sync with the Next.js rewrite in kovalevanton-site/next.config.mjs.
  base: '/arkanoid/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
