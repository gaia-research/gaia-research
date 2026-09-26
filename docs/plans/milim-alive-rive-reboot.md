# Milim Alive: Rive reboot

Status: active direction as of 2026-09-27.

The canonical tracker is [gaia-research/milim#16](https://github.com/gaia-research/milim/issues/16).
The durable shipping-agent brief lives in the private `gaia-research/milim`
repository at `docs/MILIM-ALIVE-SHIPPING-BRIEF.md`.

## Website responsibility

Gaia Research should consume the official Rive web/React runtime behind a thin
semantic Milim adapter. The website owns mounting, responsive placement,
pointer normalization, accessibility, reduced-motion behavior, lifecycle and
fallbacks. It should not own Milim mesh/deformer/physics implementation.

The old custom Milim Player pipeline is historical evidence, not the production
architecture.

## Acceptance

The website-side work is complete when the live Rive Milim feels alive in the
real Gaia Research page, passes responsive/reduced-motion/offscreen validation,
and the bespoke Milim animation engine is no longer required for the shipped
experience.
