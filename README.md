# url-state-sync

> Minimal URL ⇄ state sync store — framework-agnostic, zero-dependency.

A tiny store that keeps your state in memory and syncs it to the URL query — **you decide when it writes**.

## Install

```bash
pnpm add url-state-sync
```

## Usage

```ts
import { createURLStore } from 'url-state-sync'

const store = createURLStore({ keyword: '', category: '', page: 1 })

store.getState()             // { keyword, category, page }  — snapshot, safe to destructure
store.get('page')            // read one field
store.set({ keyword: 'x' })  // mutate memory only — does NOT touch the URL
store.sync()                 // manually write current state → URL (replaceState)
store.reset()                // back to defaults + write URL
```

- **Manual sync** — `set` only changes memory; call `sync()` when you actually want the address updated (e.g. on a "Search" click). This is the whole point: no surprise history spam while typing.
- **Destructure freely** — every method is a closure, so `const { set, sync, getState } = store` works. (`getState()` is a function, so it always returns the latest snapshot — no stale-destructure trap.)
- **Back / forward** — `popstate` is listened by default; state re-reads from the URL. Opt out with `{ listenPopState: false }`.
- On init, `state` = your defaults **merged with** the URL.

## Type inference (v1)

URL values are guessed: number / `true` / `false` / otherwise string.

> ⚠️ **v1 caveat:** guessing means a long numeric string — a snowflake ID like `2069365971128094722` — gets turned into a `Number` and **loses precision** (`…094722` → `…094700`). If your params include IDs like that, keep them out of the store for now. A schema-based, type-safe version (strings stay strings) is next on the roadmap.

## Roadmap

This is v1 — deliberately tiny. Planned, one version at a time:

- **v2** — schema-based typing (no guessing; `accountId: ''` stays a string)
- **v3** — `subscribe` for framework-free reactive UIs
- **later** — array / multi-value params, pluggable adapters (vue-router, hash routing…), Vue composables (`useUrlFields` 等)

## License

MIT
