import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASH_PATH || "/billing-vite",
  optimizeDeps: {
    include: ['axios']
  }
});