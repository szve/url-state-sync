<script setup lang="ts">
import { ref, watch } from 'vue'
import { createURLStore } from 'url-state-sync'

interface Search {
    keyword: string
    category: string
    page: number
}

const store = createURLStore<Search>({ keyword: '', category: '', page: 1 })

// v1 还没有 subscribe，这里用一个 ref 镜像 store，改动后手动 refresh 显示
const view = ref<Search>(store.getState())
const url = ref(window.location.search || '(empty)')
function refresh() {
    view.value = store.getState()
    url.value = window.location.search || '(empty)'
}
// 后退 / 前进后刷新显示
window.addEventListener('popstate', refresh)

function onField(key: keyof Search, e: Event) {
    const el = e.target as HTMLInputElement
    store.set({ [key]: key === 'page' ? Number(el.value) : el.value } as Partial<Search>)
    refresh()
}
function onSync() {
    store.sync()
    refresh()
}
function onReset() {
    store.reset()
    refresh()
}
</script>

<template>
    <main>
        <header>
            <h1>url-state-sync <small>v1 · createURLStore</small></h1>
        </header>

        <p class="url">
            <span>URL</span>
            <code>{{ url }}</code>
        </p>

        <section>
            <h2>createURLStore <span class="tag">manual sync</span></h2>
            <p class="hint">改输入只改内存 state（下面 state 变、URL 不变）；点 <b>Sync to URL</b> 才写地址。v1 还没 subscribe，所以这里手动 refresh
                显示。</p>

            <div class="row">
                <label>keyword <input :value="view.keyword" @input="e => onField('keyword', e)"></label>
                <label>category <input :value="view.category" @input="e => onField('category', e)"></label>
                <label>page <input :value="view.page" type="number" @input="e => onField('page', e)"></label>
                <button @click="onSync">Sync to URL</button>
                <button class="ghost" @click="onReset">Reset</button>
            </div>

            <pre>state = {{ view }}</pre>
        </section>

        <p class="foot">
            改输入 → <b>state 变、URL 不变</b>；点 <b>Sync to URL</b> 才更新地址；<b>刷新页面</b>后 state 会从 URL 恢复。
        </p>
    </main>
</template>
