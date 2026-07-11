# Commission Brief — Milim "Take Root" Illustration

**Status:** Active. Replaces the vector SVG circuit-tree asset in the "Let the research take root" section (`<RegistryHandoff />`).

## Purpose

To visually reinforce the transition from open research to the Gaia Skill Tree by replacing the abstract circuit-tree SVG with an atmospheric, character-driven illustration of Milim Nova resting at the base of a massive golden tree. This grounds the "Take Root" metaphor in our world and character, offering a moment of quiet, cinematic beauty before handing off to the registry.

## Target Surface & Assembly

*   **Component:** `components/RegistryHandoff.tsx`
*   **Placement:** On the right side, replacing the `<figure className="registry-tree">` SVG.
*   **Behavior:** The image will be treated as a responsive `<picture>` or `next/image` element, blending into the obsidian background.
*   **Quality Assurance:** After integration, we will use the `impeccable` skill to ensure the layout remains balanced and typography breathes. The `visual-audit` skill must be run to guarantee no horizontal cut-off occurs on mobile breakpoints.

## Source of Truth (Character Lock)

Refer to `../marketing-tasks/MILIM.md` for strict character adherence. 

*   **Age/Proportions:** Youthful chibi proportions (8-10 years old).
*   **Hair:** Very long, flowing bright pink hair, completely unbound (no twintails). Neat, choppy bangs with exactly **two small yellow star hairpins** on the left.
*   **Face:** Closed eyes, looking peaceful/sleeping.
*   **Outfit:** Oversized pitch-black hoodie with "DRAGONOID No. 1" and the white baby dragon print. Black thigh-high socks with two neon pink stripes, chunky black/white/pink sneakers.
*   **Rule:** No third-party anime/IP likeness.

## Required Deliverable

A single, highly polished conceptual illustration.

*   **Composition:** Bird's eye view (looking down). Milim is **very, very small**, emphasizing the massive, gigantic scale of the Yggdrasil-like golden tree she is sitting against. The tree dominates the frame with a lot of sprawling branches.
*   **Subject:** Milim Nova (fully specified above) as a small silhouette, but retaining her signature pink hair, hairpins, and hoodie. She is sleeping at the base/roots of the tree.
*   **Environment:** A colossal Yggdrasil skill tree made of pure gold, with countless branches and falling golden "sakura" leaves drifting down.
*   **Art Style:** Dramatic, cinematic, epic concept art. **Less anime-like**, focusing on scale, lighting, and awe. 
*   **Lighting/Palette:** Moody, cinematic lighting. High contrast against the rich gold of the tree.
*   **Background:** **Transparent backdrop** (or a clean solid black `#000000` background that can be easily keyed out via the `prep-cutout.ts` script) to seamlessly blend into the `RegistryHandoff` section's `#05060a` canvas. 
*   **Format:** 16:9 or roughly square framing that works well in a right-aligned flex column. Minimum 2048px on the longest edge.

## Production Method

Per `CLAUDE.md`, asset generation must use the `gaia-image-production` skill workflow. 
For production, **always use image gen 2 / `gpt-image-2`**. 

1.  **Generate Candidates:** Run multiple prompts targeting the bird's eye view and scale contrast. Outputs go to `assets/workbench/generated/`. (A mockup `milim-golden-tree-mockup.jpg` currently exists as an early prototype).
2.  **Select & Refine:** Choose the strongest composition and run targeted variations if the character details (hairpins, outfit) need correction.
3.  **Process:** Use the asset scripts to generate responsive exports (AVIF/WebP) and update the ledger.
4.  **Integrate:** Update `RegistryHandoff.tsx` to use the new exported images, ensuring `alt` text describes the scene for accessibility.

## Acceptance Checklist

- [ ] Features Milim Nova as a tiny silhouette but retaining her `MILIM.md` traits.
- [ ] Bird's eye view emphasizing the massive, gigantic scale of the Yggdrasil golden tree with many branches.
- [ ] Art style is dramatic and less anime-like.
- [ ] Falling golden leaves present.
- [ ] Transparent backdrop (or solid black for clean cutout).
- [ ] Moody, cinematic lighting over a dark background.
- [ ] Generated via `gpt-image-2` following `gaia-image-production` rules.
- [ ] Integrated into `RegistryHandoff.tsx` replacing the old SVG.
- [ ] Passed `visual-audit` mobile check with no cut-off.
- [ ] Layout spacing checked via `impeccable` skill.
