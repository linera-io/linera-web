import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        sidebar: resolve(__dirname, 'src/sidebar/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        welcome: resolve(__dirname, 'src/welcome/index.html'),
        "content-script": resolve(__dirname, 'src/content-script/index.ts'),
        "service-worker": resolve(__dirname, 'src/service-worker/index.ts'),
        manifest: resolve(__dirname, 'public/manifest.json'),
      },
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
      }
    },
  },
})
