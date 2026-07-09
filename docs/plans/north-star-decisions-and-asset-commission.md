# North Star Decisions & Asset Commission List

_Last updated: 2026-07-09_

## Locked product decisions

- **Context Diet is priority Lab / Benchmark 001.** It should be treated as the first real interactive Lab and benchmark surface, not a side experiment.
- **Gaia Skill Tree is considered complete for the current web-planning phase.** It will supersede the previous `/atlas` framing as the canonical registry/product destination.
- **Vercel is the locked deployment target** for the Next.js App Router build, including preview deployments.
- **GitHub OAuth and Supabase are locked platform decisions.** Implementation details, schema, callbacks, and auth UX will be defined in future PRs.
- **Social channels are Twitter/X, Reddit, and GitHub only.** Do not include Discord as a production CTA or footer destination.
- **Avatars are done.** Milim and Nova avatar assets are considered approved unless a later brand pass requests variants.
- **Context Diet assets are mostly done.** Remaining work should focus on production export formats, crops, UI integration assets, and any commission-quality hero/supporting illustrations that are missing.

## Existing assets to keep / curate

| Asset | Path | Status | Notes |
|---|---|---:|---|
| North Star full Research comp | `assets/North Star - Gaia Research.png` | Direction reference | Do not ship as rasterized UI. Use as layout/design reference. |
| North Star Research long-page comp | `assets/North Star - Gaia Research Hero.png` | Direction reference | Useful for homepage density and section rhythm. |
| North Star Skill Tree comp | `assets/North Star - Gaia Skill Tree.png` | Reference / lower priority | Skill Tree is complete and supersedes Atlas planning. Keep for continuity only. |
| Chief Scout hero | `assets/generated/chief-scout-hero.png` | Candidate production hero | Needs responsive crops and compression. |
| Research OG image | `assets/generated/research-og.png` | Candidate OG base | Needs 1200×630 export and text-safe crop check. |
| Raphael archive preview | `assets/generated/raphael-archive-preview.png` | Defer / curate | Keep for registry/Skill Tree context, not primary Research homepage. |
| Milim avatar PNG/JPG | `assets/brand/Milim-avatar.*` | Approved avatar | Done. Use in profile/directive contexts. |
| Nova avatar PNG/JPG | `assets/brand/Nova-avatar.*` | Approved avatar | Done. Use where Nova appears in product narrative. |
| Brand SVG system | `assets/brand/logo`, `assets/brand/icon`, `assets/brand/ui` | Production-ready base | Continue using `currentColor` UI icons and hand-authored marks. |

## Assets to generate, export, or commission

### A. Required production exports

These are not new creative commissions; they are productionization tasks for assets we already have.

- [ ] `chief-scout-hero` responsive set:
  - desktop 16:9 AVIF/WebP
  - tablet 4:3 AVIF/WebP
  - mobile 9:16 or 3:4 crop AVIF/WebP
  - transparent/cutout PNG if useful for layered hero composition
- [ ] `research-og` social set:
  - Open Graph 1200×630
  - Twitter/X card 1200×675 or 1600×900
  - no rasterized small text in the final crop
- [ ] Avatar export set:
  - Milim 512×512, 256×256, 128×128 WebP/PNG
  - Nova 512×512, 256×256, 128×128 WebP/PNG
  - optional circular mask-safe versions
- [ ] Favicon/app icon set from existing SVG mark:
  - `favicon.ico`
  - 32×32 PNG
  - 180×180 Apple touch icon
  - 192×192 and 512×512 PWA icons
- [ ] Brand preview/contact-sheet image for README/social sharing.

### B. Context Diet Lab / Benchmark assets

Context Diet is the first Lab / Benchmark and should get a distinct but on-brand visual kit.

- [ ] Context Diet hero illustration: Milim/Nova inspecting a compressed prompt pipeline or token stream.
- [ ] Context Diet benchmark badge: compact mark for “Lab 001” / “Benchmark 001”.
- [ ] Token compression visual motif:
  - before/after token blocks
  - shrinking context window
  - diet meter / calorie-style token counter, but technical not gimmicky
- [ ] Prompt analyzer UI mock assets:
  - input pane
  - reduced output pane
  - token savings meter
  - export-to-`SKILL.md` chip
- [ ] Context Diet OG image:
  - 1200×630
  - dark lab background
  - no small unreadable text
  - clear “Context Diet” title rendered in HTML where possible, not baked into reusable art
- [ ] Benchmark result icons:
  - token reduction
  - faithfulness retained
  - latency saved
  - cost saved
  - export validity
- [ ] Empty/loading/error-state illustrations for the lab.
- [ ] A small animated or static “context stream being compressed” accent for hero or dashboard use.

### C. Homepage / Research portal assets

- [ ] Production logo lockup: mark + `GAIA` + `[RESEARCH]` as SVG/outlined vector.
- [ ] Hero background overlays:
  - grid layer
  - pink spark layer
  - blue verification/circuit layer
  - vignette layer
- [ ] Research Ledger icon set refinements:
  - paper
  - spec
  - dataset
  - API
  - protocol
  - benchmark
- [ ] Milim Directive console accent art, preferably reusable as SVG/transparent PNG.
- [ ] Gateway panel illustrations for:
  - Labs
  - Benchmarks
  - Ledger
  - Gaia Skill Tree
  - Docs/specs
- [ ] Footer/system-status visual treatment without Discord iconography.

### D. Gaia Skill Tree / Registry support assets

Gaia Skill Tree is complete and supersedes Atlas as a planning priority, but the Research site still needs bridge assets.

- [ ] Gaia Skill Tree product tile / gateway art.
- [ ] Registry/trust record plaque component assets.
- [ ] Optional Raphael archive image crop for a future registry page, if still desired.
- [ ] Ivory/gold visual bridge tokens only if a Skill Tree route is built inside this repo later.

### E. Social/community assets

Only Twitter/X, Reddit, and GitHub should be represented.

- [ ] Twitter/X header image.
- [ ] Reddit community banner.
- [ ] GitHub organization/repo social preview image.
- [ ] Launch announcement image for Context Diet.
- [ ] No Discord CTA, icon, or footer link in production UI.

## Commission brief

Commission work should preserve the North Star direction without copying existing anime/IP characters. The characters must read as original Gaia Research mascots, not direct references.

### Style requirements

- Cyber-Slime Laboratory: obsidian dark canvas, sharp HUD geometry, Milim Pink, Rimuru Blue.
- High-energy but credible research tone.
- No rasterized UI copy in illustrations unless explicitly approved for a one-off social image.
- Composition must work behind semantic HTML text.
- Avoid generic SaaS gradients, beige AI startup styling, and illegible tiny UI details.

### Deliverables requested from artist/designer

- Layered source file where possible.
- PNG master at 2× or higher.
- WebP/AVIF exports for production.
- Crops for desktop/tablet/mobile.
- Confirmation of originality and no direct character/IP copying.
- Transparent-background variants where useful.

## GitHub issue draft

### Title

Finalize North Star decisions and production asset commission list for Context Diet launch

### Body

## Summary

Lock the updated North Star decisions into the design system and prepare the production/commission asset list for the first Lab / Benchmark launch: **Context Diet**.

## Locked decisions

- Context Diet is priority Lab / Benchmark 001.
- Gaia Skill Tree is considered complete for current planning and supersedes the older Atlas framing.
- Vercel is the deployment target.
- GitHub OAuth + Supabase are locked, with implementation details deferred to future PRs.
- Production social links are Twitter/X, Reddit, and GitHub only. No Discord CTA/footer link.
- Milim and Nova avatars are done.
- Context Diet assets are mostly done; remaining work is production export, crops, integration, and any missing commission-quality support art.

## Tasks

### Design docs

- [ ] Append locked decisions to `DESIGN.md`.
- [ ] Keep North Star comps as references, not rasterized UI sources.
- [ ] Update any future footer/social specs to remove Discord.

### Production exports

- [ ] Export responsive `chief-scout-hero` AVIF/WebP set.
- [ ] Export `research-og` social card variants.
- [ ] Export avatar size ladder for Milim and Nova.
- [ ] Generate favicon/app/PWA icon set from existing SVG mark.

### Context Diet assets

- [ ] Finalize Context Diet hero illustration.
- [ ] Create Lab 001 / Benchmark 001 badge.
- [ ] Create token compression motif and benchmark result icons.
- [ ] Create prompt analyzer UI mock/support assets.
- [ ] Create Context Diet OG/social image.
- [ ] Create empty/loading/error state illustrations.

### Homepage / portal assets

- [ ] Create production GAIA RESEARCH logo lockup SVG.
- [ ] Build reusable hero overlays and lab grid layers.
- [ ] Create gateway art for Labs, Benchmarks, Ledger, Gaia Skill Tree, and Docs/specs.
- [ ] Create Milim Directive console accent art.

### Social/community

- [ ] Twitter/X header.
- [ ] Reddit banner.
- [ ] GitHub social preview.
- [ ] Context Diet launch image.
- [ ] Remove/avoid Discord production iconography.

## Acceptance criteria

- `DESIGN.md` clearly reflects the locked decisions.
- Asset backlog distinguishes existing, production-export, generated, and commissioned assets.
- Context Diet has enough production assets to ship as the first Lab / Benchmark.
- No rasterized UI text is used for core site content.
- No Discord links/icons appear in production UI.
