<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
    <UFooter>
        <template #left>
            <p class="text-sm text-muted">
                MIT © 2026 szve
            </p>
        </template>

        <template #right>
            <UButton icon="i-lucide-book-open" color="neutral" variant="ghost"
                :to="localePath('/docs/getting-started')" aria-label="Docs" />
            <UButton icon="i-simple-icons-npm" color="neutral" variant="ghost"
                to="https://www.npmjs.com/package/url-state-sync" target="_blank" aria-label="npm" />
            <UButton icon="i-simple-icons-github" color="neutral" variant="ghost"
                to="https://github.com/szve/url-state-sync" target="_blank" aria-label="GitHub" />
        </template>
    </UFooter>
</template>
