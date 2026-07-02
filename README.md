# url-state-sync

> Minimal, type-safe URL ⇄ state sync store — framework-agnostic, zero-dependency.

This is a pnpm monorepo.

| Package | Description |
| :-- | :-- |
| [`packages/core`](./packages/core) | `url-state-sync` — the published library |
| [`packages/playground`](./packages/playground) | Vite + Vue demo (not published) |

See [packages/core/README.md](./packages/core/README.md) for full usage.

## Develop

```bash
pnpm install
pnpm --filter url-state-sync test   # run core tests
pnpm play:dev                       # start the playground
```

## License

MIT
