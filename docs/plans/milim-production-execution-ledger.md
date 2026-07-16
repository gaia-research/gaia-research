# Milim production execution ledger

- **Authority:** `docs/plans/milim-player-pipeline-plan.md`
- **Active public PR:** #52 (draft until every Phase 3–7 exit is complete)
- **Active private PR:** `gaia-research/milim#1` (draft)
- **Tracer:** `milim-web-0.1.2`
- **Production candidate:** `milim-web-0.2.0`

This ledger is the restart packet for the production completion run. A green
tracer test does not satisfy a production art, Studio, motion, composition, or
owner-approval gate.

## Frozen decisions

- The public homepage uses one approved full-bleed Cyber-Slime Laboratory v2
  composition. It does not expose scene-selection review controls.
- Halo and Signal remain release/QA variants until explicitly promoted.
- `/milim/qa` is the deterministic noindex review surface for all expressions,
  motions, scenes, reduced motion, failure modes, and measurements.
- Decorative mascot chatter never uses an ARIA live region and may not cover a
  primary CTA at any viewport.
- The website pins one immutable release directly. `current.json` is a
  promotion/audit pointer, not the runtime source of truth.
- `0.1.x` is immutable tracer history. Production work creates `0.2.0`.

## Exact worker lanes

| Lane | Branch | Ownership | State |
| --- | --- | --- | --- |
| Sol XHigh Worker | `dev/milim-player-v2-sol` | private `player/`, `tests/player/` | active |
| Terra High Worker | `dev/milim-studio-v2-terra` | private compiler, Studio, scripts, tests | active |
| Luna Med Worker | `dev/milim-art-v2-luna` | private art, model source, scenes, fixtures, evidence, skills | active |
| Sol Ultra Planner/Reviewer | `dev/milim-player-mvp` | contracts, schemas, integration, release, review | active |

No differently specced agent may take over a lane. Each lane commits and pushes
its own branch before the integrator cherry-picks it.

## Milestones

- [x] Critique captured: 25/40; four P1s.
- [x] `0.1.2` reclassified as tracer baseline.
- [x] Production completion checklist committed privately.
- [x] Production model/scene/Studio schemas frozen privately.
- [ ] Art source lock integrated.
- [ ] Rig and personality lock integrated.
- [ ] Studio MVP lock integrated.
- [ ] Layered scene lock integrated.
- [ ] Private player v2 lock integrated.
- [ ] `milim-web-0.2.0` assembled and validated.
- [ ] Website QA and one-scene hero integrated.
- [ ] Performance, cache, fallback, responsive, and accessibility gates pass.
- [ ] Owner visual review passes final desktop/tablet/mobile captures.
- [ ] Both PRs green with final evidence comments.

## Final acceptance artifacts

- Private production source, rig, physics, expressions, motions, Studio project,
  scene layers, provenance, contact sheets, videos, and reports.
- Private immutable release with source commit and checksum inventory.
- Byte-identical website promotion and explicit immutable runtime pin.
- QA evidence for all semantic states and fallbacks.
- Startup, transfer, frame interval, long-task, inactive-frame, and cache-header
  measurements.
- Full responsive visual audit and final Impeccable critique.
