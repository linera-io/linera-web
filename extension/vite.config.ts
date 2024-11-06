import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'mpa',
  build: {
    sourcemap: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        'confirm-popup': resolve(__dirname, 'src/popup/confirm/index.html'),
        'welcome-popup': resolve(__dirname, 'src/popup/welcome.html'),
        'sidebar': resolve(__dirname, 'src/sidebar/index.html'),
        'options': resolve(__dirname, 'src/options/index.html'),
        'offscreen': resolve(__dirname, 'src/service-worker/offscreen/index.html'),
        'content-script': resolve(__dirname, 'src/content-script/index.ts'),
        'service-worker': resolve(__dirname, 'src/service-worker/index.ts'),
        // Hack: this forces a separate chunk for `linera_web.js`
        'wasm-shim': resolve(__dirname, 'src/wallet/client/linera_web.js'),
      },
      preserveEntrySignatures: 'strict',
      output: {
        minifyInternalExports: false,
        entryFileNames: '[name].js',
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
