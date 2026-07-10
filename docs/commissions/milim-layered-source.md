# Commission Brief — Milim Layered Source (Rigging Input for milim-live2d-model)

**Status:** Active dependency. Blocks the interactive-rigging step of the
`milim-live2d-model` pipeline. Non-blocking for the runtime/integration code,
which can be built and tested against a placeholder rig first.

## Purpose

Produce a **layered, separated source illustration** of **Milim Nova** suitable
for auto-rigging in Stretchy Studio (the FOSS Live2D-alternative tool that powers
`milim-live2d-model`). The existing hero sprite
(`assets/generated/north-star-live/milim-live-full-body-sprite-v01.png`) is a
**flattened** render — it cannot be rigged. Rigging requires every moving part on
its own cleanly-masked layer.

This commission is the **input** to rigging; it is not the rig itself. It
supersedes the "commission an external Cubism artist" path in
`docs/commissions/milim-live2d-rig.md` — we now rig in-house via Stretchy, so we
only need the layered art, not a finished `.moc3`.

## Source of truth (character lock)

The character specification is unchanged from `docs/commissions/milim-live2d-rig.md`
("Character lock" section). In brief: original Gaia Research mascot; youthful
chibi proportions; very long **unbound** bright-pink hair (no twintails); neat
choppy bangs; exactly **two** small bright-yellow star hairpins on the left bangs;
large bright-blue eyes with lashes; tiny fang on broad smile; oversized black
hoodie with neon-pink drawstrings + original white baby-dragon graphic +
`DRAGONOID No. 1` print; short black denim cut-offs; black thigh-high socks with
two neon-pink stripes; chunky black/white high-top sneakers with pink accents.

Originality rule stands: **no third-party anime/IP** likeness, costume, symbols,
or names.

## Required deliverable

A single layered PSD (or equivalent lossless layered format), full-body, neutral
"A-pose"/relaxed standing pose, transparent background, **2048 px+** on the long
edge:

```
milim-layered-v1.psd
```

### Layer separation (each an independent, cleanly-masked layer/group)

Mirror the commission's "Layering and deformers" spec so Stretchy can auto-detect
parts. Name layers with side suffixes (`-l` / `-r`) where paired — Stretchy's
`matchTag` / `splitLR` logic keys off these:

- **Face:** face base, left eye, right eye, left eyelid, right eyelid, left brow,
  right brow, mouth (with a couple of open/smile variants if easy), fang, blush.
- **Hair:** front hair / bangs, left side lock, right side lock, back hair mass,
  star-pin 1, star-pin 2, loose hair tips.
- **Hoodie:** hoodie body, hood, left sleeve, right sleeve, drawstrings, front
  dragon graphic, left wrist decal, right wrist decal, hem.
- **Body/limbs:** left upper arm, right upper arm, left forearm+hand, right
  forearm+hand (separated at the elbow so gestures can bend), shorts, left leg,
  right leg, left sock (+stripe), right sock (+stripe), left shoe (+laces),
  right shoe (+laces).
- **Optional:** rim-light layer, laboratory-reflection layer (for the 2.5D look).

### Notes for the illustrator / generator

- Parts that overlap in the flat render must be **painted complete behind**
  neighbors (e.g. the torso continues behind the arms) so deformation doesn't
  reveal holes.
- Keep the hoodie graphic and `DRAGONOID No. 1` print on their own layers; do not
  bake site UI text, charts, or labels into the art.
- Art direction: Cyber-Slime Laboratory palette — obsidian `#05060a`, Milim Pink
  `#ec4899`, Rimuru Blue `#38bdf8`. Polished 2D character art.

### Production method

Per `CLAUDE.md`, asset generation uses **image gen 2 / `gpt-image-2` only** (never
nano-banana). Generated experiments go to `assets/workbench/` first, then promote
reviewed layers. Hand-separation of the existing sprite into layers is an
acceptable alternative to regeneration if it yields cleaner masks.

## Acceptance checklist

- [ ] All listed parts on independent, cleanly-masked layers with `-l`/`-r`
      naming where paired.
- [ ] Overlapped regions painted complete behind neighbors (no holes on deform).
- [ ] Character matches the locked spec (unbound hair/no twintails, 2 yellow star
      pins, full outfit, one approved expression readable).
- [ ] Transparent background, 2048 px+ long edge, lossless layered format.
- [ ] Youthful, joyful, non-sexualized, original; no third-party IP.
- [ ] Loads in Stretchy Studio and auto-rig detects the major parts.

## Handoff

Deliver `milim-layered-v1.psd` (place source under `assets/workbench/` first,
promote reviewed to `assets/generated/north-star-live/`). Update
`content/assets/asset-ledger.json` via the sync scripts. Tracking issue:
**gaia-research#33** (blocks the rig-authoring step, gaia-research#34; part of
the Milim Live commission, gaia-research#32).
