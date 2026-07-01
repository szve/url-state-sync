import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // store 直连 window/location/history，用 happy-dom 提供浏览器环境
        environment: 'happy-dom',
        include: ['tests/**/*.test.ts'],
    },
})
