# Vendored: milim-live2d-model runtime

This directory is a **synced copy** of the framework-agnostic runtime from the
open-source [`milim-live2d-model`](https://github.com/gaia-research/milim-live2d-model)
repo (`packages/runtime/src/`). It is vendored here so the Next.js build is
self-contained (no git/npm-link dependency during CI/deploy).

- **Source of truth:** `milim-live2d-model` — make runtime changes there, then
  re-sync. Do not diverge this copy.
- **License/attribution:** MIT. Portions adapted from Stretchy Studio (MIT,
  © 2026 Nguyen Phan). Attribution headers are preserved in each file; see the
  upstream repo's `NOTICE`.
- **Consumed by:** `components/MilimLive.tsx` (the `"use client"` hero wrapper).

To re-sync:

```bash
cp -r ../milim-live2d-model/packages/runtime/src/* lib/milim-live2d/
```
