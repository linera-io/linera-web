import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/hosted/fungible/',
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        linera: '@linera/client',
      },
      preserveEntrySignatures: 'strict',
    },
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
  optimizeDeps: {
    exclude: [
      '@linera/client',
    ],
    include: ['@adraffy/ens-normalize'],
  },
  ssr: {
    noExternal: ['@adraffy/ens-normalize'],
  }
})
