# url-state-sync

> Minimal, type-safe URL ⇄ state sync store — framework-agnostic, zero-dependency.

A tiny store that keeps your state in memory and syncs it to the URL query — **you decide when it writes, and values keep their declared types.**

## Install

```bash
pnpm add url-state-sync
```

## Usage

```ts
import { createURLStore } from 'url-state-sync'

const store = createURLStore({
  keyword: '',
  page: 1,
  tags: [] as string[],
})

store.getState()             // { keyword, page, tags } — snapshot, safe to destructure
store.get('page')            // read one field
store.set({ keyword: 'x' })  // mutate memory only (or auto-sync with { immediate: true })
store.sync()                 // manually write state → URL (replaceState)
store.reset()                // back to defaults + write URL

const off = store.subscribe(s => render(s)) // notified on set / reset / back-forward
off()                        // unsubscribe
```

## Type-safe by schema

`initialState` doubles as a **type schema** — each field is decoded from the URL back to the type of its default:

```ts
const store = createURLStore({
  accountId: '',        // string  → stays a string
  amount: 0,            // number  → Number()
  active: false,        // boolean → 'true' / 'false'
  tags: [] as string[], // array   → multi-value (?tags=a&tags=b)
})
```

That's the whole reason a schema exists: **long numeric strings keep their precision.** A snowflake ID like `2069365971128094722` declared as `accountId: ''` stays exactly that string — it is never coerced to a `Number` (which would round it to `…094700`). Only declared fields are read; unknown query params are ignored.

## Options

```ts
createURLStore(initial, {
  immediate: true,       // write the URL on every set (default false — manual sync)
  listenPopState: false, // stop re-reading on back/forward (default true)
})
```

- **Manual sync** — by default `set` only touches memory; call `sync()` when you actually want the address updated (e.g. on a "Search" click). No history spam while typing.
- **Destructure freely** — every method is a closure; `getState()` is a function, so there's no stale-snapshot trap.
- **Back / forward** — `popstate` re-reads state from the URL by default.

## Roadmap

- ✅ **v1** — minimal manual store
- ✅ **v2** — schema-based typing (snowflake-safe) + array / multi-value params
- ✅ **v3** — `subscribe` for reactive UIs (notified on any state change)
- **later** — pluggable adapters (vue-router, hash routing…), Vue composables

## License

MIT
