import defineConfig, { GLOB_MARKDOWN_CODE, parserPlain } from '@wzo/eslint-config'

export default defineConfig(
    {
        vue: true,
        ignores: ['**/dist/**', '**/.output/**'],
    },
    {
        // README code blocks are reading examples (unused demo vars, API signatures),
        // not source to compile — treat them as plain text.
        files: [GLOB_MARKDOWN_CODE],
        name: 'url-state-sync/markdown-plain',
        languageOptions: { parser: parserPlain },
    },
)
