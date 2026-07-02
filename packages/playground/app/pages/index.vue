<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
    title: () => t('home.title'),
    description: () => t('home.description'),
})
</script>

<template>
    <UContainer class="py-12 sm:py-16">
        <!-- Hero -->
        <div class="mx-auto max-w-2xl text-center">
            <UBadge color="primary" variant="subtle" class="mb-4">
                zero-dependency · type-safe
            </UBadge>
            <h1 class="text-4xl font-bold tracking-tight text-highlighted sm:text-5xl">
                url-state-sync
            </h1>
            <p class="mt-4 text-lg text-muted">
                {{ t('home.description') }}
            </p>
            <div class="mt-6 flex items-center justify-center gap-3">
                <UButton :to="localePath('/docs/getting-started')" icon="i-lucide-book-open" size="lg">
                    {{ t('home.getStarted') }}
                </UButton>
                <UButton to="https://github.com/szve/url-state-sync" target="_blank" icon="i-simple-icons-github"
                    color="neutral" variant="subtle" size="lg">
                    GitHub
                </UButton>
            </div>
        </div>

        <!-- Interactive demo (client-only: the store touches window/history) -->
        <div class="mx-auto mt-12 max-w-2xl">
            <UrlStateDemo />
        </div>
    </UContainer>
</template>
