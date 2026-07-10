# Commission Brief — Milim Live2D Cubism Rig

**Status:** Future production commission; non-blocking for the North Star Live draft.

## Purpose

Create an authentic Live2D Cubism rig of **Milim Nova**, Gaia Research’s Chief Capability Scout, for the homepage hero, Lab 001 support moments, and future campaign surfaces.

Until this rig exists, the website uses a clearly labelled **code-driven 2.5D sprite loop** with a static fallback. It is not an MOC3/Live2D implementation and must never be presented as one.

## Source of truth

1. `/data/data/com.termux/files/home/marketing-tasks/MILIM.md` — canonical character specification.
2. `PRODUCT.md` and `DESIGN.md` — Gaia Research voice and Cyber-Slime Laboratory visual system.
3. `assets/brand/BRAND.md` — brand colors and geometric rules.
4. `docs/plans/north-star-decisions-and-asset-commission.md` — platform, originality, and production constraints.

The future generated full-body static Milim hero sprite is a visual reference only. It does not replace the character specification or constitute a rig source file.

## Character lock

The rig must depict an **original Gaia Research mascot**, not a copy or imitation of any third-party character or franchise.

- Youthful chibi proportions: an expressive, oversized head and compact body; no adult-coded posing, framing, or costume treatment.
- Bright pink hair: very long, naturally flowing, **completely unbound** down the back; neat choppy bangs; **no twintails**.
- Exactly two small bright-yellow star hairpins on the left side of the bangs.
- Large, expressive bright-blue eyes with visible lashes.
- A tiny stylized fang appears only with a broad smile.
- Oversized, drop-shoulder pitch-black hoodie with neon-pink drawstrings and small star/dragon-scale wrist decals. The front shows an original cute white baby-dragon graphic and the approved `DRAGONOID No. 1` print.
- Short black denim cut-offs, barely visible below the hoodie hem.
- Black thigh-high socks with exactly two thin neon-pink stripes at each top hem.
- Chunky retro high-top sneakers: black/white base, thick white soles, black tongues, neon-pink accents and laces.

### Required expressions

1. **Joyful Winker** — wide confident smile, tiny fang, one playful wink.
2. **Demon Lord Smirk** — cheeky, assured grin with slightly lowered eyelids.
3. **Starry Awe** — wide sparkling eyes, bright open-mouthed smile.
4. **Chaos Gremlin** — puffed cheeks or a teasing/shocked wide-eyed response.

## Art direction

- **World:** Cyber-Slime Laboratory: obsidian `#05060a`, Milim Pink `#ec4899`, Rimuru Blue `#38bdf8`, sharp HUD geometry, restrained hot-pink sparks, and clear negative space for semantic HTML.
- **Hero role:** full-body subject for a right-weighted desktop hero, with enough clean silhouette to crop for tablet and mobile.
- **Pose:** standing or floating in a confident, childlike full-body stance. Hands, feet, hairpins, hoodie, socks, and shoes must remain separately drawable and visible in the neutral pose.
- **Rendering:** polished 2D character art with materially convincing 3D laboratory light and reflections behind it. Do not bake production UI text, charts, buttons, or small labels into the character art.
- **Originality:** do not include lookalike costume parts, signature symbols, names, or references from third-party anime/IP.

## Required deliverables

Deliver the editable Cubism source project and exported runtime package. Do not flatten the character into a single texture before handoff.

```text
milim-v1/
  milim-v1.model3.json
  milim-v1.moc3
  milim-v1.physics3.json
  milim-v1.pose3.json
  expressions/
    joyful-winker.exp3.json
    demon-lord-smirk.exp3.json
    starry-awe.exp3.json
    chaos-gremlin.exp3.json
  motions/
    idle-breathe.motion3.json
    idle-look.motion3.json
    greet.motion3.json
    point.motion3.json
  textures/
    milim-v1-texture-00.png
    milim-v1-texture-01.png
  source/
    milim-v1.cmo3
    milim-v1-layered.psd
    readme.md
```

- Cubism SDK-compatible `.model3.json` and `.moc3`.
- Texture atlas PNGs, max 4096 px each, with premultiplied-alpha requirements documented.
- `.physics3.json` and `.pose3.json` files.
- One `.exp3.json` per approved expression and one `.motion3.json` per required motion.
- Layered PSD (or equivalent lossless layered source) plus Cubism `.cmo3` project.
- A transparent 2048 px+ full-body PNG and a 1024 px portrait PNG for static/reduced-motion fallbacks.
- A contact sheet showing all expressions and each motion’s start, middle, and end poses.

## Layering and deformers

The artist must preserve independent, cleanly masked layers for:

- Face base, separate left/right eyes, eyelids, brows, mouth variants, fang, and blush.
- Front hair, side locks, back hair masses, individual star pins, and loose hair tips.
- Hoodie body, hood, sleeves, drawstrings, front graphic, wrist decals, and hem.
- Left/right arms, hands, fingers needed for the approved gestures, shorts, left/right legs, socks/stripes, left/right shoes, and laces.
- Optional independent rim-light and laboratory-reflection layers.

Rig at minimum: head X/Y/Z, body X/Y/Z, eye X/Y, eye open L/R, brow L/R, mouth form/open, breath, hair sway, sleeve sway, arm movement, hand gesture, and expression switching. Hairpin movement must be subtle and stable; hoodie art must not warp into unreadable fragments.

## Motion requirements

- **Idle breathe:** 8–12 second seamless loop; low-amplitude breath, hair/sleeve physics, occasional blink, no attention-demanding bounce.
- **Idle look:** 6–10 second seamless loop; slight gaze/head shift and calm return.
- **Greet:** one short, optional non-looping welcoming gesture.
- **Point:** one short, optional non-looping interface/CTA gesture.
- Expressions must be callable independently of idle motion.
- Keep physics readable at 30fps and 60fps. No rapid flashing, erratic movement, or motion that obstructs content.

## Future web integration

Target a future Next.js App Router build. Place final reviewed runtime files under:

```text
public/live2d/milim/v1/
```

Use a client-only Live2D Cubism renderer loaded after primary content. The hero must retain meaningful HTML heading, navigation, actions, and image fallback if WebGL, JavaScript, reduced motion, or the renderer fails.

- Lazy-load the renderer after the first contentful paint.
- Respect `prefers-reduced-motion`: show the static full-body PNG with no continuous movement.
- Never make the character the only route to navigation or essential information.
- Provide a descriptive alternative text/fallback caption where the sprite conveys meaningful status; use empty alt text when purely decorative.
- Implement a performance budget and pause animation when the hero is offscreen or the document is hidden.

## Naming and export rules

- Use lowercase kebab-case file names only.
- Version folders are immutable (`v1`, `v2`, …); do not overwrite prior reviewed packages.
- Ship no rasterized core-site text except the approved hoodie graphic.
- Provide desktop, tablet, and mobile crop-safe notes for the transparent fallback PNG.

## Acceptance checklist

- [ ] Character matches the locked specification, including unbound hair/no twintails, two yellow star pins, complete outfit, and one approved expression.
- [ ] Visual framing is youthful, joyful, non-sexualized, and original.
- [ ] All listed Cubism files load without console errors in the supplied viewer.
- [ ] Expression files and motions switch independently and cleanly.
- [ ] Idle loops are seamless; hair, hoodie, and physics remain stable.
- [ ] Texture seams, alpha fringes, clipping, and draw-order failures are absent at 1× and 2× DPR.
- [ ] Static transparent PNG fallback matches the approved rig appearance.
- [ ] Reduced-motion and no-WebGL fallback requirements are demonstrated.
- [ ] Vendor provides source files, licensing/originality confirmation, and permission for web use.
- [ ] Review confirms no third-party character/IP was copied or referenced in final artwork.

## Vendor handoff checklist

Provide before final acceptance:

- Source package, exported package, texture license/originality statement, and version manifest.
- A short parameter map: each parameter’s name, range, purpose, and dependent art meshes.
- A motion map: trigger, duration, loop behavior, and intended UI use.
- A short integration note covering Cubism SDK version, rendering assumptions, texture premultiplication, and tested browsers.
- One review call or annotated video showing rig controls and all required expressions/motions.

## Exclusions

This commission does **not** include homepage UI, copy, navigation, procedural 3D laboratory backgrounds, analytics, authentication, or a generic animated video export. It is specifically a reusable, accessible, original Live2D Cubism mascot rig and static fallback package.
