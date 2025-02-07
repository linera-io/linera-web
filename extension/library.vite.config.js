import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: 'dist/library',
        copyPublicDir: false,
        emptyOutDir: true,
        sourcemap: true,
        assetsInlineLimit: 0,
        lib: {
            entry: 'src/library/index.ts',
            name: 'linera-web',
            fileName: 'linera',
        },
        rollupOptions: {
            external: ['env'],
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
