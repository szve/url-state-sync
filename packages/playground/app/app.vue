<script setup lang="ts">
const { locale } = useI18n()

useHead({
    htmlAttrs: { lang: computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US')) },
    titleTemplate: title => (title ? `${title} · url-state-sync` : 'url-state-sync — URL ⇄ state sync store'),
})
</script>

<template>
    <UApp>
        <AppHeader />
        <UMain>
            <NuxtPage />
        </UMain>
        <AppFooter />
    </UApp>
</template>
