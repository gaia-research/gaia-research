# Context Ablation editorial thumbnail

**Status:** approved — warm morning variation with classic sailor uniform

**Asset:** 16:9 Gaia Research editorial thumbnail, final 1600×900 WebP

**Model:** `gpt-image-2` only

**Output staging:** `assets/workbench/generated/` → reviewed `assets/generated/` + `public/assets/`

The approved variation is the warm morning classroom: a vast, quiet classroom owns roughly 90% of the frame; cheerful Milim sweeps in the lower-right beside a plain school satchel. Keep her long bright-pink hair completely unbound — **no twintails** — with blue eyes and exactly two yellow star hairpins. Her approved outfit is a classic sailor-style school uniform: white sailor blouse, deep navy collar with two white stripes, red neckerchief, dark navy pleated skirt, white knee socks, and black school shoes. Use broad flat editorial screenprint shapes and subtle paper texture. No readable text, letters, numbers, labels, logos, watermarks, UI, code, charts, graphs, diagrams, trees, forests, or photorealism.

## Variation 1 — warm morning classroom

A calm, enormous elementary classroom after morning assembly, seen from far away. Broad polished wood floor, tall windows, pale cream walls, distant rows of empty desks, floating dust in warm morning light; palette of warm cream, ochre, muted coral, and a small Milim-pink accent. In the lower-right, microscopic chibi Milim carefully sweeps with a simple broom, focused and quietly determined. Keep the environment expansive and the character 4–6% of the total image height.

## Variation 2 — rainy after-school room

A quiet after-school classroom seen from a long diagonal perspective. Cool blue light passes through rain-streaked windows onto a reflective floor; pale sage walls and empty desks fade into soft distance. Palette of muted teal, blue-gray, sage, and one bright pink accent. In the lower-right, microscopic chibi Milim sweeps the floor as a diligent student, with a calm focused expression. Keep 90% of the frame as still architecture and negative space; character 4–6% of frame height.

## Variation 3 — late-afternoon lecture hall

A vast old lecture classroom in soft late-afternoon mauve and muted gold light, with tall arched windows, orderly empty desks, and a broad quiet floor. The chalkboard is turned away or completely blank, with no marks. Use a restrained mauve, dusty-gold, cream, and pink palette with flat screenprint shapes and gentle paper grain. In the lower-right, microscopic chibi Milim sweeps with a simple broom as a diligent student; the world remains dominant and the character is 4–6% of frame height.

## Production handoff

The warm morning sailor-uniform variation is approved for integration.

After a candidate is selected, export the reviewed image at exactly 1600×900 WebP, add its alt text and provenance to `content/assets/asset-ledger.json` via the asset sync script, copy the production derivative to `public/assets/`, and run:

```bash
npx tsx scripts/assets/sync-asset-ledger.ts
npx tsx scripts/assets/check-asset-ledger.ts --strict
```
