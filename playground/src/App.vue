<script setup lang="ts">
import { ref } from 'vue'
import SchemaDemo from './SchemaDemo.vue'
import TestDemo from './TestDemo.vue'

const tab = ref<'schema' | 'vue'>('schema')
</script>

<template>
    <main>
        <header>
            <h1>url-state-sync <small>v3</small></h1>
            <nav>
                <button :class="{ active: tab === 'schema' }" @click="tab = 'schema'">schema-typed</button>
                <button :class="{ active: tab === 'vue' }" @click="tab = 'vue'">vue integration</button>
            </nav>
        </header>

        <SchemaDemo v-if="tab === 'schema'" />
        <TestDemo v-else />
    </main>
</template>

<style scoped>
nav {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
}

nav button {
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--muted);
    background: transparent;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

nav button:hover {
    color: var(--text);
}

nav button.active {
    color: #fff;
    border-color: var(--accent);
    background: color-mix(in oklab, var(--accent) 18%, transparent);
}
</style>
