import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASH_PATH || "/billing-vite",
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    // example: include: ['some-package']
  }
});