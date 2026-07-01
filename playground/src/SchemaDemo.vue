<script setup lang="ts">
import { ref } from 'vue'
import { createURLStore } from 'url-state-sync'

// initialState 兼作类型 schema：每个字段按默认值的类型编解码
interface Search {
    accountId: string // string → 保持字符串（雪花ID 不丢精度）
    amount: number // number → Number()
    active: boolean // boolean → 'true' / 'false'
    tags: string[] // array → 多值 ?tags=a&tags=b
}

const store = createURLStore<Search>({ accountId: '', amount: 0, active: false, tags: [] })

const view = ref<Search>(store.getState())
const url = ref(window.location.search || '(empty)')

// v3: subscribe —— set / reset / 后退前进 时自动更新 view + url，无需手动 refresh
store.subscribe((state) => {
    view.value = state
    url.value = window.location.search || '(empty)'
})

const ALL_TAGS = ['vue', 'react', 'svelte']

function setAccountId(e: Event) {
    store.set({ accountId: (e.target as HTMLInputElement).value })
}
function setAmount(e: Event) {
    store.set({ amount: Number((e.target as HTMLInputElement).value) })
}
function setActive(e: Event) {
    store.set({ active: (e.target as HTMLInputElement).checked })
}
function toggleTag(tag: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked
    const tags = store.get('tags')
    store.set({ tags: checked ? [...tags, tag] : tags.filter(t => t !== tag) })
}
function fillSnowflake() {
    store.set({ accountId: '2069365971128094722' })
}
function onSync() {
    store.sync()
    url.value = window.location.search || '(empty)' // sync 不改 state、不 notify，这里手动刷 url
}
function onReset() {
    store.reset()
}
</script>

<template>
    <p class="url">
        <span>URL</span>
        <code>{{ url }}</code>
    </p>

    <section>
        <h2>createURLStore <span class="tag">type-safe by schema</span></h2>
        <p class="hint">按 initialState 的类型解码：<code>accountId</code> 是 string（雪花ID 不丢精度）、<code>amount</code> 是 number、<code>tags</code> 是数组。改值只改内存，点 <b>Sync to URL</b> 才写地址。UI 靠 <code>store.subscribe</code> 自动更新。</p>

        <div class="grid">
            <div class="field">
                <label>accountId <span class="ty">string</span></label>
                <input :value="view.accountId" placeholder="snowflake id…" @input="setAccountId">
                <button class="ghost" @click="fillSnowflake">Fill snowflake ID</button>
            </div>
            <div class="field">
                <label>amount <span class="ty">number</span></label>
                <input :value="view.amount" type="number" @input="setAmount">
            </div>
            <div class="field">
                <label>active <span class="ty">boolean</span></label>
                <label class="chk"><input type="checkbox" :checked="view.active" @change="setActive"> active</label>
            </div>
            <div class="field">
                <label>tags <span class="ty">array</span></label>
                <div class="tags">
                    <label v-for="t in ALL_TAGS" :key="t" class="chk">
                        <input type="checkbox" :checked="view.tags.includes(t)" @change="e => toggleTag(t, e)"> {{ t }}
                    </label>
                </div>
            </div>
        </div>

        <div class="row">
            <button @click="onSync">Sync to URL</button>
            <button class="ghost" @click="onReset">Reset</button>
        </div>

        <pre>state = {{ view }}</pre>
    </section>

    <p class="foot">
        重点：填雪花ID → <b>Sync</b> → URL 里 <code>accountId</code> 完整，<b>刷新</b>后 <code>state.accountId</code> 仍是 string（没被转 number 丢精度）；<code>amount</code> 是 number、<code>tags</code> 写成 <code>?tags=vue&tags=react</code>。
    </p>
</template>

<style scoped>
.ty {
    font-size: 10px;
    color: var(--accent);
    border: 1px solid color-mix(in oklab, var(--accent) 35%, transparent);
    border-radius: 999px;
    padding: 1px 6px;
    margin-left: 4px;
}

.tags {
    display: flex;
    gap: 12px;
    align-items: center;
}
</style>
