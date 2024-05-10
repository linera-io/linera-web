import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        sidebar: resolve(__dirname, 'sidebar.html'),
        options: resolve(__dirname, 'options.html'),
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
