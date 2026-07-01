<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { createURLStore } from 'url-state-sync'

interface Search {
    keyword: string
    status: string
    page: number
}

const store = createURLStore<Search>({ keyword: '', status: '', page: 1 })

// 用 vue 的 reactive 包一层：v-model 直接绑，watch 同步到 store
const form = reactive<Search>(store.getState())
const url = ref(window.location.search || '(empty)')
const immediate = ref(false) // 开关：改动是否立即写 URL

// v3: subscribe —— 后退/前进/reset 时自动回填 form + 刷新 url（替代手动 popstate 桥接）
store.subscribe((state) => {
    Object.assign(form, state)
    url.value = window.location.search || '(empty)'
})

// form 变 → 同步到 store；immediate 开启时顺带写 URL
watch(form, () => {
    store.set({ ...form })
    if (immediate.value) store.sync()
    url.value = window.location.search || '(empty)'
}, { deep: true })

// 手动同步（immediate 关闭时用）
function onSync() {
    store.set({ ...form })
    store.sync()
    url.value = window.location.search || '(empty)'
}
</script>

<template>
    <p class="url">
        <span>URL</span>
        <code>{{ url }}</code>
    </p>

    <section>
        <h2>Vue 集成 <span class="tag tag-live">reactive + watch + subscribe</span></h2>
        <p class="hint">用 vue 的 <code>reactive</code> 包一层，<code>v-model</code> 直接绑，<code>watch</code> 同步到 store；<code>store.subscribe</code> 负责后退/前进时回填 form。用开关切 <code>immediate</code>：<b>开</b>=改输入立即写 URL；<b>关</b>=只改内存、点 Sync 才写。</p>

        <div class="row">
            <label>keyword <input v-model="form.keyword"></label>
            <label>status <input v-model="form.status"></label>
            <label>page <input v-model.number="form.page" type="number"></label>
        </div>

        <div class="row">
            <label class="chk"><input v-model="immediate" type="checkbox"> immediate（改动即写 URL）</label>
            <button :disabled="immediate" @click="onSync">Sync to URL</button>
        </div>

        <pre>form = {{ form }}</pre>
    </section>

    <p class="foot">
        <b>immediate 开</b>：改 v-model → 立即写 URL；<b>关</b>：只改内存，点 Sync 才写。<b>刷新 / 后退</b>后 form 从 URL 恢复（由 <code>subscribe</code> 自动回填）。
    </p>
</template>
