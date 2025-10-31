import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5173,
    strictPort: false,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    include: [
      'lodash' // Pre-bundle lodash to avoid module resolution issues
    ],
    exclude: ['@rdkit/rdkit']
  },
  build: {
    commonjsOptions: {
      include: [/ketcher/, /node_modules/]
    }
  },
  define: {
    // Define process.env para el browser
    'process.env': {},
    'global': 'globalThis'
  }
})
