import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 直接把 url-state-sync 指向库源码，改库即时生效
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            'url-state-sync': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
        },
    },
})
