# Milim Live2D Model — finalized plan & implementation record

> **Superseded (2026-07-16).** The Stretchy-native production path and proposed
> public milim-live2d-model repository are no longer the approved direction.
> The ratified source of truth is
> [Milim Player and Private Production Pipeline](./milim-player-pipeline-plan.md):
> a Milim-specific, dependency-free first release owned by a private repository
> and promoted into the website as an immutable compiled artifact. This file is
> retained as a historical implementation record for the existing prototype.

**Status:** Superseded implementation record. **Original date:** 2026-07-11.
**Branch:** `feat/milim-live2d-integration` (worktree off `origin/feat/north-star-live-v2`).
**Tracking issue:** gaia-research#32. **Supersedes:** the external-Cubism-artist
approach in `docs/commissions/milim-live2d-rig.md`.

## Summary

The original commission asked for a Live2D **Cubism** rig (`.moc3`) of Milim from a
paid artist — a `.moc3` is the compiled output of the proprietary Cubism Editor and
cannot be hand-authored. Firecrawl scoping found **[Stretchy Studio](https://github.com/MangoLion/stretchystudio)**
(MIT, Vite + React + WebGL2): a FOSS tool that auto-rigs a layered PSD and whose
WebGL runtime renders the full parameter set. This removes **both** the proprietary
editor and the paid rigging step.

**Key architectural finding.** Stretchy's `.moc3` *exporter* covers only 20/41
parameters (`WARP_EXPORT_AUDIT.md`), but its *native runtime* is fully data-driven
and renders everything authored. So we **ship the native scene, not a `.moc3`** — the
exporter gap is irrelevant to the website. The real blocker is **authoring the rig**
(a human step in Stretchy), not patching the exporter. A portable `.moc3` export is
deferred to an optional future deliverable (issue #36).

## Two-repo architecture (as built)

```
milim-live2d-model/                 # NEW OSS repo — vanilla, light, MIT (attributes Stretchy)
  packages/runtime/src/
    renderer/  program, transforms, partRenderer, scenePass (+iris stencil), shaders, tags
    playback/  clock (PlaybackClock), animationEngine, resolvePose (deformation pipeline)
    stage.js   createMilimStage(canvas, {scene, textures, ...}) → imperative handle
    loader.js  fetchScene / loadTextures / loadSceneBundle
    index.js + *.d.ts
  examples/vanilla/  placeholder-rig smoke demo (proves the pipeline headless + in-browser)
  models/milim-v1/   exported rig bundle lands here (placeholder README for now)
  README.md (SEO), CONTRIBUTING.md, LICENSE (dual MIT), NOTICE, .github/REPO_METADATA.md

gaia-research/ (this repo, v2 line)
  components/MilimLive.tsx   thin "use client" wrapper — hero concerns only
  lib/milim-live2d/          vendored runtime copy (synced from the OSS repo; VENDOR.md)
  app/page.tsx               static <Image className="milim-sprite"> → <MilimLive/>
  app/globals.css            canvas layer + crossfade; reduced-motion hides canvas
  public/live2d/milim/v1/    scene bundle deploy target (populated by issue #34)
```

Boundary rule (held): `milim-live2d-model` imports **no React/Next**; `gaia-research`
**never reimplements runtime logic** — it mounts a canvas, lazy-loads the runtime,
and owns reduced-motion / offscreen-pause / fallback / a11y.

## The runtime (how it renders)

Per-frame loop (reimplemented from Stretchy's `CanvasViewport` tick, as pure
functions): `clock.tick` → `resolvePose` (keyframe pose → parameter-driven overrides
→ blend shapes → warp deformers) → `uploadPositions` for deformed meshes →
`ScenePass.draw`. GL context flags are load-bearing: `premultipliedAlpha:false` +
`ONE/ONE_MINUS_SRC_ALPHA` blend for correct transparent compositing; `stencil:true`
for iris→eyewhite clipping. Verified headless: blink blendshape collapses the eye
mesh, warp deformer bilinearly deforms descendants, clock loops without NaN.

## Integration (the hero)

`MilimLive.tsx` is the repo's 2nd client component (after `ContextDietAnalyzer`). It:
- opts out entirely under `prefers-reduced-motion` (static sprite only);
- dynamically imports the runtime **after first paint** (first use of the pattern in-repo);
- pauses on `IntersectionObserver` offscreen + `visibilitychange` hidden;
- drives look-at from the pointer;
- **falls back to the static `<Image>`** on any failure (no WebGL2 / missing bundle /
  decode error) — the hero is fully functional without the live stage.

Verified: `tsc --noEmit` clean; `next build` passes; `/` still static-prerendered
(~112 kB First Load JS — runtime is client-lazy, not in the initial bundle).

## Open-source / SEO

`milim-live2d-model` is MIT with **full Stretchy Studio attribution** (LICENSE +
NOTICE, "please star & support Stretchy"). README is keyword-first
(`live2d` / `live2d-model` / `vtuber`), with a comparison table, a star/use CTA, and
the full API. Topics + description recipe in `.github/REPO_METADATA.md` (apply at
push via `gh repo edit`).

## Follow-ups (human-in-the-loop, tracked)

| Issue | Step | Blocks |
| --- | --- | --- |
| #33 | Produce layered Milim source art (`milim-layered-v1.psd`) | rig authoring |
| #34 | Author rig in Stretchy (expressions + motions) → export bundle to `public/live2d/milim/v1/` | live hero |
| #35 | Push `milim-live2d-model` remote + apply SEO metadata (+ optional npm) | discoverability |
| #36 | *(optional/future)* patch Stretchy `.moc3` exporter (20/41-param gap) | portable Cubism binary |

Commission docs: `docs/commissions/milim-layered-source.md` (rigging input, this repo),
`docs/commissions/milim-live2d-rig.md` (original brief; character-lock still the target).

## Risks / notes

- **Rig authoring** is the critical path — a manual Stretchy session, not code.
- **Layered art** must exist before rigging (current sprite is flattened).
- **Vendored runtime** in `lib/milim-live2d/` is a synced mirror — change the OSS repo,
  then re-copy (see `lib/milim-live2d/VENDOR.md`); don't diverge.
- **Cloudflare/OpenNext:** confirm dynamic `import()` + `/live2d/...` static assets
  serve correctly (no basePath today) when the bundle lands.
