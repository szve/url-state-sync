import process from 'node:process'
import { fileURLToPath } from 'node:url'

// Pages deploys under /<repo>/; normalize to a trailing slash so asset hrefs
// concatenate correctly whether or not the env value carries one.
const rawBase = process.env.NUXT_APP_BASE_URL || '/'
const baseURL = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

export default defineNuxtConfig({
    modules: [
        '@nuxt/ui',
        'nuxt-content-twoslash',
        '@nuxt/content',
        '@nuxtjs/i18n',
        '@vueuse/nuxt',
    ],
    content: {
        // Use Node's built-in node:sqlite (Node 22+) instead of the native
        // better-sqlite3 addon, so no compile step is needed locally or in CI.
        experimental: { sqliteConnector: 'native' },
        build: {
            markdown: {
                // Same dual theme as the app, so docs code blocks match light/dark mode.
                highlight: {
                    theme: { default: 'github-light', dark: 'github-dark' },
                    langs: ['ts', 'js', 'bash', 'css', 'json', 'vue'],
                },
            },
        },
    },
    css: ['~/assets/css/main.css'],
    i18n: {
        defaultLocale: 'en',
        strategy: 'prefix_except_default',
        locales: [
            { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
            { code: 'zh', name: '中文', language: 'zh-CN', file: 'zh.json' },
        ],
    },
    app: {
        head: {
            link: [
                // baseURL-aware so the icon resolves under a Pages sub-path (/<repo>/)
                { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
            ],
        },
    },
    vite: {
        resolve: {
            // Point the workspace package at core's source for instant HMR — no rebuild needed.
            alias: {
                'url-state-sync': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
            },
        },
    },
    devtools: { enabled: false },
    compatibilityDate: '2025-01-01',
})
