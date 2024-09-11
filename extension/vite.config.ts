import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        'confirm-popup': resolve(__dirname, 'src/popup/confirm/index.html'),
        'welcome-popup': resolve(__dirname, 'src/popup/welcome.html'),
        'sidebar': resolve(__dirname, 'src/sidebar/index.html'),
        'options': resolve(__dirname, 'src/options/index.html'),
        'offscreen': resolve(__dirname, 'src/service-web-worker/offscreen/index.html'),
        'content-script': resolve(__dirname, 'src/content-script/index.ts'),
        'service-worker': resolve(__dirname, 'src/service-worker/index.ts'),
      },
      output: {
        preserveModules: false,
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
