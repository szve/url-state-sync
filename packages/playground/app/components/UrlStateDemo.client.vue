<script setup lang="ts">
import { createURLStore } from 'url-state-sync'

const { t } = useI18n()

interface Search {
    keyword: string
    page: number
    tags: string[]
}

const store = createURLStore<Search>({ keyword: '', page: 1, tags: [] })
const form = reactive<Search>(store.getState())
const url = ref(window.location.search || '(empty)')
const immediate = ref(false)

const TAGS = ['vue', 'react', 'svelte']

const refreshUrl = () => (url.value = window.location.search || '(empty)')

// v3 subscribe: 后退/前进/reset 自动回填 form + 刷新 url
store.subscribe((state) => {
    Object.assign(form, state)
    refreshUrl()
})

watch(form, () => {
    store.set({ ...form })
    if (immediate.value) store.sync()
    refreshUrl()
}, { deep: true })

function onSync() {
    store.set({ ...form })
    store.sync()
    refreshUrl()
}
function onReset() {
    store.reset()
}
</script>

<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-link" class="size-5 text-primary" />
                    <span class="font-semibold text-highlighted">{{ t('demo.title') }}</span>
                </div>
                <USwitch v-model="immediate" :label="t('demo.immediate')" />
            </div>
        </template>

        <div class="space-y-4">
            <UFormField :label="t('demo.keyword')">
                <UInput v-model="form.keyword" placeholder="type…" class="w-full" />
            </UFormField>
            <UFormField :label="t('demo.page')">
                <UInput v-model.number="form.page" type="number" :min="1" class="w-32" />
            </UFormField>
            <UFormField :label="t('demo.tags')">
                <UCheckboxGroup v-model="form.tags" :items="TAGS" orientation="horizontal" />
            </UFormField>

            <div class="flex gap-2">
                <UButton :disabled="immediate" icon="i-lucide-refresh-cw" @click="onSync">
                    {{ t('demo.sync') }}
                </UButton>
                <UButton color="neutral" variant="subtle" icon="i-lucide-rotate-ccw" @click="onReset">
                    {{ t('demo.reset') }}
                </UButton>
            </div>
        </div>

        <template #footer>
            <div class="space-y-3">
                <div class="flex items-center gap-2 text-sm">
                    <span class="font-mono text-dimmed">URL</span>
                    <code class="font-mono text-primary">{{ url }}</code>
                </div>
                <pre class="overflow-x-auto rounded-md bg-elevated p-3 text-xs">{{ JSON.stringify(form, null, 2) }}</pre>
            </div>
        </template>
    </UCard>
</template>
