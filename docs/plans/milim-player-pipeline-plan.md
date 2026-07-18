# Public Milim Player and Private Production Pipeline

- **Status:** Ratified; repository boundary amended 2026-07-18
- **Ratified:** 2026-07-16
- **Tracking:** gaia-research#32
- **Priority:** Website implementation first; reusable Milim Player seam in the same release
- **Private source repository:** gaia-research/milim (private)
- **Public player repository:** gaia-research/milim-player (public)
- **Website consumer:** gaia-research
- **Archived predecessor:** gaia-research/milim-live2d-model (archived; Stretchy-dependent)
- **Supersedes:** docs/plans/milim-live2d-model-plan.md and the Stretchy/Cubism production paths

## Ratified decision

Gaia Research will build a Milim-specific character production pipeline and
dependency-free web player. The project will not use Stretchy Studio, Cubism
Core, a generic Live2D runtime, or a third-party animation framework for its
first release.

The private gaia-research/milim repository owns:

- editable Milim art and rig sources;
- Milim Studio, the character-specific authoring environment;
- the compiler and validators;
- model, scene, engine, and release versioning;
- generated preview and acceptance artifacts;
- future hair, outfit, pose, scene, and input-adapter improvements.

The public gaia-research/milim-player repository owns the dependency-free
runtime implementation, stable browser API, renderer, lifecycle, validation,
and public-safe player tests. It contains no editable Milim art, models, scenes,
Studio source, compiler, private fixtures, release evidence, or credentials.

The public gaia-research website repository consumes an exact compiled web
release promoted from the private repository. Each bundle records and includes
an exact reviewed milim-player version and commit. Promoted browser assets are
committed into gaia-research so production builds require no access token,
private package registry, submodule checkout, or runtime dependency on either
source repository.

This decision separates two concerns:

1. The private repository protects editable source, authoring tools, release
   history, and unpublished experiments.
2. The public player makes the reusable runtime inspectable without publishing
   Milim production inputs or pipeline history.
3. The browser artifact is necessarily public after deployment. No secret,
   private credential, or unpublished source material may be embedded in it.

The Stretchy-dependent `milim-live2d-model` repository is archived and is not a
source, dependency, or release destination. Changing this ownership model,
adding a shipped third-party runtime, or returning to a Cubism/Stretchy
deliverable requires an explicit amendment to this plan.

## Product outcome

The MVP is a polished, web-native Milim experience on the Gaia Research
homepage. Milim must:

- use the long, unbound pink hairstyle and Dragonoid hoodie outfit established
  by the current full-body sprite;
- breathe and blink with restrained, seamless idle motion;
- look toward the pointer without snapping or excessive head movement;
- expose Joyful Winker, Demon Lord Smirk, Starry Awe, and Chaos Gremlin;
- perform short greet and point motions, then return smoothly to idle;
- include an independently rigged animated Milim splash-art scene;
- pause when hidden or offscreen;
- provide static reduced-motion, loading, error, and no-WebGL fallbacks;
- preserve semantic HTML, navigation, and calls to action outside the canvas.

The current V1 sprite is the binding visual gold master and fallback, not a
license to regenerate the character. Production art must preserve its face,
proportions, pose energy, hair rendering, outfit silhouette, protected
graphics, and overall illustration quality while reconstructing complete
modular parts hidden by the current pose. A separately generated whole-character
neutral that merely matches the written character description is invalid.

All Phase 3 image work uses the `gaia-image-production` workflow with
`gpt-image-2` only. Generation is limited to reference-guided edits or inpainting
for hidden regions and approved replacement limbs. The owner must approve a
full-resolution V1-versus-candidate neutral comparison before layer separation,
rigging, or Phase 4 visual acceptance proceeds.

The project is reuse-and-polish first. Existing approved V1 neutral,
expression, greet, and point masters are authoritative inputs and visual
targets. Workers must inventory and reuse them before generating anything. The
milestone phases harden and modularize completed work; they do not authorize
new whole-character, expression, gesture, or scene art from scratch.

## MVP priorities

Priority order is binding:

1. A working website vertical slice using the Milim Player interface.
2. A stable, modular player and compiled bundle contract.
3. Final default hair, outfit, expression, pose, and background quality.
4. Repeatable private-repository compilation, validation, and promotion.
5. Authoring convenience beyond what is required to maintain Milim v1.

Milim Studio is deliberately Milim-specific. It is not a general animation
product and must not delay the first website release by attempting to support
arbitrary characters or arbitrary file formats.

## First-release dependency policy

The shipped first release has zero third-party production dependencies.

- Milim Player uses browser-native JavaScript modules, WebGL2, Canvas 2D where
  useful, Pointer Events, ImageBitmap/image decoding, and requestAnimationFrame.
- The compiler and release scripts use Node.js built-ins and node:test.
- The source format is folders of PNG/WebP assets plus readable JSON.
- PSD, ZIP, Cubism, Stretchy, Spine, Rive, and generic animation packages are
  not required.
- The website receives ordinary JavaScript modules, JSON, images, and a release
  manifest.
- External QA tools may inspect the release, but no code from those tools ships
  in the player.

The existing lib/milim-live2d prototype contains MIT-attributed adaptations
from Stretchy. It may be used as behavioral evidence during migration, but it
is not the v1 module contract. Any retained adapted code keeps its notice and
provenance. New Milim-owned modules should be implemented against this plan and
the Milim format rather than the Stretchy project shape.

## GitHub Free governance policy

Repository governance must use only controls available on GitHub Free.

- The public milim-player repository uses basic branch protection: pull request,
  one approval, Code Owner review, resolved conversations, and a required test.
- The private milim pipeline uses documented compensating controls where GitHub
  Free cannot enforce private-repository branch protection: no direct main
  pushes, pull-request review, green validation before manual merge, and
  immutable release directories.
- Paid organization rulesets, merge queues, and environment gates are not phase
  acceptance criteria and must not block the plan.
- Making production source public is never an acceptable workaround for a
  missing private-repository control.

## System shape

The system is three deep modules joined at two explicit seams:

    Milim source
        |
        v
    Milim Studio ----> Milim Compiler ----> immutable release bundle
                                                |
                                                v
                                          Milim Player
                                                |
                              +-----------------+-----------------+
                              |                                   |
                        Gaia website                    future VTuber adapter

### Module 1: Milim Studio

Milim Studio is a local browser authoring environment. Its interface is an
editable Milim source directory; its output is updated source JSON, layer art,
meshes, keyforms, expressions, motions, physics definitions, scenes, and
previews.

The MVP Studio surface contains six workspaces:

1. **Art** — import and inspect layers, slots, anchors, masks, draw order, and
   crop bounds.
2. **Rig** — edit pivots, meshes, warp cages, parameter keyforms, and physics
   chains.
3. **Expressions** — author semantic facial presets and art switches.
4. **Motions** — author and preview idle, greet, point, and return transitions.
5. **Appearance** — manage default hair/outfit packs and compatible replacements.
6. **Scene** — arrange background, character, foreground, parallax, lighting,
   and restrained procedural effects.

Studio uses native browser image decoding and canvas pixel access for mesh
generation. The first mesh generator may use a regular clipped grid rather than
general-purpose triangulation. The goal is predictable deformation with a
small number of vertices, not mathematically optimal meshes.

Studio is not required to edit arbitrary JSON. It presents Milim concepts and
writes deterministic source data.

### Module 2: Milim Compiler

The compiler interface is:

    compileMilim(sourceDirectory, outputDirectory) -> CompileReport

The implementation hides normalization, mesh validation, curve compilation,
asset copying, hash generation, compatibility checks, preview generation, and
release-manifest assembly.

Compilation must be deterministic: identical source produces identical
manifest and model data apart from an explicitly injected release timestamp.

The compiler rejects:

- missing required parts or anchors;
- textures outside approved dimensions or formats;
- invalid triangles, non-finite vertices, or mismatched keyforms;
- unknown semantic channels;
- incompatible hair, outfit, pose, or scene packs;
- expression presets without a neutral reset path;
- non-looping idle clips or discontinuous loop endpoints;
- unsupported draw-order transitions;
- missing reduced-motion fallbacks;
- release version collisions;
- files not represented in the source manifest.

The compiler emits both machine and human evidence:

- compile-report.json;
- expression contact sheet;
- motion start/middle/end contact sheet;
- static desktop/tablet/mobile previews;
- texture and transfer-size report;
- compatibility and checksum manifest.

### Module 3: Milim Player

Milim Player presents a small semantic interface. Website code does not know
part IDs, mesh vertices, raw channels, render passes, or curve storage.

    const milim = await mountMilim(canvas, {
      src: "/milim/releases/milim-web-0.1.0/release.json"
    });

    milim.set({
      expression: "demon-lord-smirk",
      hair: "classic-long-pink",
      outfit: "dragonoid-hoodie-v1",
      scene: "milim-splash-v1"
    });

    milim.drive({
      gaze: { x: 0.4, y: -0.1 },
      head: { x: 0.15, y: 0, z: -0.05 },
      mouthOpen: 0
    });

    await milim.perform("greet");
    milim.setRunning(false);
    milim.destroy();

The public interface is limited to:

- mountMilim(canvas, options);
- set(partial durable state);
- drive(normalized live controls);
- perform(one-shot motion), returning completion or interruption;
- setRunning(boolean);
- destroy().

All state changes are safe before loading completes. Unsupported requested
variants return a structured error and retain the last valid state. Destroy is
idempotent.

## Semantic control model

The source and player use Milim-owned semantic channels rather than Cubism
parameter names:

- head.turn, head.nod, head.tilt;
- body.turn, body.lean, body.tilt;
- eyes.open.left, eyes.open.right;
- eyes.look.x, eyes.look.y;
- brows.form.left, brows.form.right;
- mouth.form, mouth.open;
- cheeks, fang, breath;
- hair.front.sway, hair.side.sway, hair.back.sway;
- sleeves.sway, drawstrings.sway;
- arm.left.pose, arm.right.pose;
- hand.left.pose, hand.right.pose;
- base.x, base.y.

Each channel maps to one or more transforms, opacity switches, mesh keyforms, or
warp cages. One channel may affect many parts; website callers never manage
those relationships.

## Frame composition and motion arbitration

Every frame is resolved in this order:

1. Neutral model state.
2. Durable appearance and scene selection.
3. Live drive input such as pointer gaze or future face tracking.
4. Procedural idle and automatic blinking.
5. Selected expression.
6. One-shot motion overlay.
7. Secondary hair, sleeve, and drawstring physics.
8. Final visibility, masking, draw-order, and scene composition.

The mixer distinguishes additive and overriding channels. Expressions remain
independent of idle motion. Greet and point may temporarily override arm and
hand channels while leaving breath, blink, and restrained hair motion active.
Every one-shot clip defines an entrance, hold if needed, and return transition.

## Rendering architecture

Milim Player owns one canvas and one WebGL2 context. Its render passes are:

1. Background scene layers.
2. Background procedural effects and parallax.
3. Back hair and rear character layers.
4. Body, outfit, face, and foreground character layers.
5. Front hair, expression overlays, and gesture replacements.
6. Foreground scene accents and restrained particles.

Generic clip groups replace the current iris-only naming convention. Masks are
declared in model data and rendered through the stencil buffer. Static draw
order is preferred; pose-specific visibility swaps are used when an arm or hand
must cross the body.

The player caps device pixel ratio, suspends all animation when inactive, and
restores from WebGL context loss or falls back to the static image.

## Art and rig contract

### Default visual packs

The MVP ships exactly one reviewed pack for each appearance slot:

- Hair: classic-long-pink
- Outfit: dragonoid-hoodie-v1
- Pose base: confident-neutral-v1
- Scene: milim-splash-v1

Hair and outfit are faithful to the current full-body sprite:

- very long, naturally flowing, unbound bright-pink hair;
- neat bangs and exactly two yellow star hairpins;
- oversized black Dragonoid hoodie with pink drawstrings and wrist decals;
- shorts, striped thigh-high socks, and chunky high-top sneakers.

The current pose hides the hands and overlaps sleeves, torso, and hair.
Production art must reconstruct those hidden regions. The fallback sprite
remains unchanged unless a separately reviewed fallback is promoted.

### Slot contracts

Hair packs provide:

- front, side-left, side-right, back, and loose-tip parts;
- crown, temple-left, temple-right, and nape anchors;
- hair-specific warp cages and physics chains;
- compatibility with all required expressions.

Outfit packs provide:

- torso, hood, sleeves, cuffs, drawstrings, hem, shorts, socks, and shoes;
- shoulder, elbow, wrist, hip, knee, and ankle anchors;
- protected graphic/text regions that may transform but not mesh-warp into
  unreadable fragments;
- optional physics rules for sleeves, hood, and drawstrings.

Pose packs provide:

- channel values and animation clips;
- optional replacement forearm, hand, sleeve, or hair-overlap art;
- explicit visibility and draw-order changes;
- crop-safety metadata.

Scene packs provide:

- background, midground, and foreground raster layers;
- parallax depth and camera framing;
- color/light tint;
- procedural effect declarations;
- static reduced-motion composition;
- desktop, tablet, and mobile crop instructions.

Character and scene packs are independent release units. A scene must load,
animate, pause, reduce motion, fall back, and tear down without owning or
embedding the Milim character model. The website release manifest pairs
compatible versions while preserving this boundary.

## Background animation MVP

Background animation is part of MVP acceptance, not a later enhancement.

Milim Splash v1 uses modular far-field, magenta-burst, cyan-burst, crystal,
glow-mask, reflective-floor, foreground-shard, and particle layers. It includes:

- slow multi-plane drift and parallax;
- restrained magenta/cyan energy and bloom pulses;
- drifting shards, sparse sparks, and star-like twinkles;
- a subtle floor shimmer and reflection response beneath Milim;
- occasional restrained light sweeps;
- optional pointer-linked movement at lower amplitude than the character gaze;
- a static reviewed fallback for reduced motion and failed initialization.

Background effects must preserve negative space for semantic homepage content,
must not imitate essential UI, and must not produce rapid flashes. The scene
pauses with the character but owns an independent lifecycle and animation clock.
Rings, cylinders, tanks, Cyber-Slime scenery, and laboratory apparatus are not
part of the production/default direction. The binding visual references and
phase mapping are recorded in private
`docs/decisions/milim-splash-pack.md`.

## Repository layout

The private production repository begins as:

    gaia-research/milim/
      AGENTS.md
      README.md
      studio/
        index.html
        app/
      compiler/
        compile.mjs
        validate.mjs
        schema/
      models/
        milim/
          v1/
            source/
      scenes/
        milim-splash/
      scripts/
        test.mjs
        release.mjs
      tests/
        fixtures/
        player/
        compiler/
      dist/
        releases/

The public player repository begins as:

    gaia-research/milim-player/
      AGENTS.md
      README.md
      docs/
        player-api.md
      player/
        index.js
        renderer/
        motion/
        physics/
        scene/
      tests/
        player/

No workspace package manager is required for v1. Browser modules remain native
ES modules. Tests use node:test for in-process behavior and a browser QA harness
for rendered behavior.

## Release and versioning model

The system records four independently governed versions:

- Player version: semantic version and public source commit, beginning 0.1.0.
- Model version: immutable Milim model major/minor/patch.
- Scene version: immutable scene pack version.
- Web release version: locks one compatible player, model, and scene set.

A release manifest contains:

    {
      "release": "milim-web-0.1.0",
      "player": "0.1.0",
      "model": "milim-v1.0.0",
      "scene": "milim-splash-v1.0.0",
      "compatibility": 1,
      "entry": "./player/index.js",
      "modelUrl": "./models/milim-v1/model.json",
      "sceneUrl": "./scenes/milim-splash-v1/scene.json",
      "checksums": {}
    }

Published version folders are immutable. Corrections create a new release.
Compatibility major versions prevent an older player from silently loading an
incompatible model.

## Promotion seam into gaia-research

The website never reaches into the private repository at build or runtime.

The private release command produces:

    dist/releases/milim-web-0.1.0/
      release.json
      player/
      models/
      scenes/
      previews/
      LICENSES.txt

Release assembly accepts only a reviewed, pinned milim-player source commit or
immutable player artifact. It verifies the player version and commit before
copying runtime files into the release. The private repository must not develop
a second player implementation.

The gaia-research promotion command:

1. accepts an authenticated local path or downloaded private release artifact;
2. verifies checksums and compatibility;
3. copies the immutable release to public/milim/releases/milim-web-0.1.0/;
4. updates the pinned release path used by MilimLive;
5. writes a promotion record containing source commit and release versions;
6. runs type, build, runtime, fallback, and visual checks;
7. produces a scoped promotion pull request.

For MVP the promotion may be a deliberate local command. Automated private
release-to-public-PR orchestration is a follow-up after the seam is proven.

The existing lib/milim-live2d directory is replaced or retired only when the
promoted Milim Player passes the complete website acceptance gate.

## Issue 32 migration

After this plan merges, the GitHub tracking structure should be reconciled:

- #32 becomes the Milim Player and private production-pipeline epic.
- #33 is retargeted from a mandatory Stretchy PSD to the modular default Milim
  source-art pack, while preserving its hidden-region and character-lock checks.
- #34 is retargeted from Stretchy authoring to Milim Studio rig, expression,
  motion, physics, and scene authoring.
- #35 is retargeted from the Stretchy-dependent milim-live2d-model repository to
  the public gaia-research/milim-player runtime, private gaia-research/milim
  production pipeline, and immutable promotion seam. The predecessor repository
  remains archived.
- #36 is closed or archived as superseded because portable .moc3 export is an
  explicit MVP non-goal.

The issue updates should link this ratified plan and the draft/merged pull
request. They should not claim the live rig is complete until the promoted
website release passes Phase 7.

## Website integration

MilimLive remains a thin client adapter. It owns:

- canvas mounting;
- the pinned release URL;
- pointer normalization;
- IntersectionObserver and document-visibility state;
- reduced-motion detection;
- static fallback and crossfade;
- route-level accessibility text;
- lifecycle cleanup.

It does not own:

- animation names beyond semantic motions;
- raw channels, meshes, layers, masks, or render passes;
- scene effects;
- version compatibility;
- expression implementation;
- physics;
- asset URL construction inside a release.

The initial website vertical slice is delivered early with a coarse but
representative model and animated scene. It proves loading, composition,
fallback, promotion, and the player interface before final art production.

## End-to-end implementation sequence

### Phase 0 — Ratification and repository bootstrap

- Merge this plan and mark prior Stretchy/Cubism plans superseded.
- Create private gaia-research/milim.
- Create public gaia-research/milim-player and archive milim-live2d-model.
- Add AGENTS.md, ownership, GitHub Free-compatible controls, and release conventions.
- Copy only necessary behavior/tests from the current prototype with provenance.
- Establish player, compiler, studio, models, scenes, and tests directories.

**Exit:** Private pipeline and public player repositories exist; the Stretchy
predecessor is archived; ownership and Free-plan controls are unambiguous.

### Phase 1 — Contracts and release seam

- Define source, compiled model, scene, and release-manifest schemas.
- Define the Milim Player interface and structured errors.
- Define default semantic channels and composition precedence.
- Implement deterministic validation and a hand-authored minimal fixture.
- Implement private release assembly from a pinned public player commit and
  public promotion verification.

**Exit:** A tiny fixture compiles, promotes, loads, renders, and tears down on the
website through the final interface.

### Phase 2 — Website-first tracer Milim

- Produce a coarse layered Milim fixture matching default hair and outfit.
- Implement head/gaze, blink, breath, and one expression.
- Implement a coarse animated `milim-splash-v1` tracer with independent scene
  lifecycle, using the ratified splash direction rather than Cyber-Slime,
  rings, or laboratory scenery.
- Add loading, reduced-motion, no-WebGL, context-loss, and missing-file behavior.
- Integrate the release into MilimLive without exposing internal model details.

**Exit:** Homepage runs the private-pipeline artifact end to end with animated
character and independently controlled splash scene; static fallback remains
fully functional. The old Cyber-Slime visual fixture is not acceptable evidence.

### Phase 3 — Production default art and rig

- Reconstruct the complete neutral art source at 2048 px or greater from the
  approved V1 visual gold master; do not regenerate the whole character.
- Reconstruct hidden hands, arms, torso, sleeves, and hair regions.
- Reject the existing donor V2 neutral candidate because its face, proportions,
  pose, hair rendering, and overall finish drift from V1.
- Lock anchors, masks, mesh density, protected graphics, and draw order.
- Author the default hair and outfit packs.
- Author head/body keyforms, gaze, mouth, brows, breath, and physics chains.
- Before separation, obtain owner approval of full-resolution V1-versus-neutral
  face, silhouette, proportion, hair, outfit, and protected-graphic audits.
- After separation, review 1:1 composites, alpha seams, anatomy, masks,
  deformation, and desktop/tablet/mobile static previews.

**Exit:** Neutral Milim matches the character lock with no holes, seams, or
unreadable outfit art under the supported deformation range. The owner has
explicitly approved the reconstructed neutral and its live-browser composite.

### Phase 4 — Expressions and motion

- Map the four existing approved V1 expression masters onto the accepted Phase
  3 rig, preserving their identity while applying neutral reset and blend
  timings; do not independently regenerate them.
- Author idle-breathe and idle-look loops.
- Map the existing V1 greet and point masters onto the rig, using them as
  gesture targets and limb donors; create only missing replacement pixels.
- Implement expression/motion arbitration and interruption semantics.
- Tune hair, sleeve, hood, and drawstring secondary motion.
- Generate contact sheets and video/screenshot evidence.

**Exit:** Required expressions and motions compose independently and return
cleanly to neutral idle at 30fps and 60fps.

### Phase 5 — Milim Studio MVP

- Add source-directory open/save workflow.
- Implement Art and Rig workspaces.
- Implement expression and motion editing.
- Implement appearance and scene pack editing.
- Implement mesh generation, warp-cage editing, curve editing, and preview.
- Integrate compiler reports and acceptance previews.

**Exit:** A maintainer can adjust Milim hair, clothes, expression, pose, or
background and produce a valid new private release without hand-editing compiled
JSON.

### Phase 6 — Splash pack and composition polish

- Produce and finalize the independent Milim Splash v1 art layers from the
  founder-ratified environment direction.
- Tune parallax, energy pulses, lighting, shards, particles, reflection, and
  desktop/tablet/mobile crops.
- Verify background motion remains subordinate to semantic content.
- Produce and approve reduced-motion static composition.
- Record source and derivative provenance, checksums, compatibility, and
  full-resolution owner visual approval.

**Exit:** The independent splash pack is production quality and passes owner,
provenance, accessibility, performance, lifecycle, and crop gates.

### Phase 7 — Production hardening and first release

- Run compiler, player, website, fallback, and visual suites.
- Measure transfer, memory, startup, frame time, and inactive CPU.
- Verify Cloudflare-served immutable paths and cache headers.
- Promote milim-web-0.1.0 to gaia-research.
- Complete final owner visual review.
- Merge the website integration only after the promoted artifact passes.

**Exit:** Milim Player and animated scene are live on the website from a pinned,
reproducible private release.

## Sub-agent strategy

Every sub-agent name follows model + effort + task. Scouts and reviewers are
read-only unless the integrator explicitly assigns a file lane. Workers use
separate worktrees and do not edit overlapping directories.

| Named sub-agent | Thinking assignment | Primary output |
| --- | --- | --- |
| Sol Ultra Planner | Resolve architecture, model semantics, compatibility, release seam, failure modes, and phase gates | Ratified interface and issue map |
| Terra High Scout | Inspect website, Cloudflare, browser, WebGL, asset, and integration constraints | Evidence-backed constraint report |
| Luna Med Scout | Inventory source art, required layers, motions, expressions, scenes, files, and acceptance traces | Complete manifests and checklists |
| Sol XHigh Worker | Implement player state, renderer, mixer, masking, physics, compatibility, and structured errors | Player modules and behavioral tests |
| Terra High Worker | Implement Studio, compiler, release assembly, promotion adapter, and website integration | Authoring/build pipeline and site adapter |
| Luna Med Worker | Build fixtures, manifests, contact-sheet data, validation cases, background declarations, and docs | Repetitive production assets and test fixtures |
| Sol Ultra Reviewer | Review interface depth, rendering correctness, motion arbitration, privacy seam, and release integrity | Blocking architecture review |
| Terra High Reviewer | Review browser behavior, performance, responsive composition, fallbacks, and Cloudflare delivery | Runtime and visual QA report |
| Luna Med Reviewer | Review manifests, version pins, checksums, documentation, and acceptance evidence for omissions | Completeness review |

### Sub-agent sequencing

1. Terra High Scout and Luna Med Scout run in parallel.
2. Sol Ultra Planner resolves their evidence into contracts and independently
   grabbable implementation tickets.
3. Contract files are frozen for the phase.
4. Sol XHigh Worker, Terra High Worker, and Luna Med Worker operate in isolated
   lanes.
5. The main integrator assembles a complete vertical slice.
6. Sol Ultra Reviewer performs the architecture gate.
7. Terra High Reviewer performs runtime and visual gates.
8. Luna Med Reviewer performs release-completeness gate.
9. Findings return to the owning Worker; reviewers do not patch their own
   findings.

### File ownership lanes

- Sol lane: public milim-player runtime, core model evaluation, physics,
  renderer, and public-safe player tests.
- Terra lane: studio/, compiler/, promotion scripts, gaia-research adapter.
- Luna lane: fixtures, source manifests, scene declarations, generated evidence,
  documentation.
- Integrator-only: shared compatibility schemas after freeze, public-player
  commit pin, release manifest, cross-repo version pins, final promotion.

## Validation and acceptance

### Functional acceptance

- Default hair and outfit visually match the current sprite.
- All four expressions work and reset cleanly.
- Idle breathe loops in 8–12 seconds without a visible seam.
- Idle look loops or schedules in 6–10 seconds without demanding attention.
- Greet and point are non-looping, interruptible, and return to idle.
- Pointer gaze is smoothed, clamped, and disabled under reduced motion.
- Background animation is present, synchronized with lifecycle pause, and has a
  reviewed static fallback.
- Character remains decorative; essential content remains semantic HTML.

### Modularity acceptance

- Website code imports only the Milim Player interface and a pinned release.
- No React module references mesh, layer, mask, physics, or curve internals.
- Public player source contains no private model, scene, Studio, compiler, or
  production-evidence files.
- Private source compiles without access to gaia-research internals.
- The same release loads in a standalone vanilla browser fixture.
- A second scene can be added without changing the player interface.
- Hair/outfit slot contracts exist even though MVP ships one reviewed pack each.

### Dependency acceptance

- No third-party JavaScript ships in the player release.
- No npm install is required to compile the private pipeline or test either the
  private pipeline or public player MVP modules.
- Browser release contains no Cubism, Stretchy, Spine, Rive, or PSD runtime.
- LICENSES.txt accounts for retained provenance and shipped assets.

### Performance budgets

- Player JavaScript target: no more than 60 KiB gzip for MVP.
- Default model plus scene transfer target: no more than 5 MiB desktop.
- Mobile may use a compiler-selected reduced texture set.
- Device pixel ratio is capped at 2.
- Target 60fps desktop and 30fps mobile under the supported scene.
- Hidden/offscreen animation consumes no requestAnimationFrame work.
- Static content and fallback render before the promoted release finishes loading.

Budgets may be tightened after the tracer slice establishes measured baselines.
Relaxing them requires evidence and an explicit plan amendment.

### Visual acceptance

- No alpha fringes, texture seams, holes, mask leakage, or draw-order failures.
- Hairpins remain stable and exactly two are visible.
- Hair remains unbound and reads consistently across expressions and motion.
- Hoodie graphic and text remain legible.
- Hands and limbs remain anatomically coherent in greet and point.
- Background preserves content contrast and mobile crop safety.
- Character framing remains youthful, joyful, original, and non-sexualized.

### Release acceptance

- Private source commit, public player commit, and release versions are recorded.
- Compiler and promotion checksums match.
- Immutable public release path exists.
- Standalone fixture and website use the same release manifest.
- Build, type, runtime, fallback, mobile-cutoff, and visual checks pass.
- Owner approves expression sheet, motion evidence, and final homepage capture.

## Risks and mitigations

### Art hidden by the current pose

The current sprite does not contain complete hands, arms, torso, or overlapped
hair. Reconstruct these as reviewed source art before production rigging. Do not
infer missing anatomy solely from automated layer separation.

### Studio scope expansion

Milim Studio supports only the semantic channels, slots, masks, curves, and
scenes required by Milim. Reject generic-character features until Milim v1 is
live.

### Pipeline/player/website release drift

The private assembler pins an exact public player commit. The website pins an
immutable release manifest and promotion record. Never copy individual files
without the checksum-verifying assembly and promotion commands.

### Player and model incompatibility

Every release records a compatibility major. The player rejects unknown majors
and retains the static fallback.

### Background cost overwhelms the hero

Use low-density effects, shared render lifecycle, DPR caps, mobile texture sets,
and measured frame budgets. The background is the first effect tier reduced on
constrained devices.

### Attribution confusion

Preserve notices for retained adapted code. Track provenance per file while the
Milim-owned implementation replaces the Stretchy-shaped prototype.

## Explicit non-goals for MVP

- Cubism .moc3, .cmo3, or Cubism SDK compatibility.
- Stretchy Studio project compatibility.
- A generic Live2D editor or runtime.
- Public npm distribution.
- Webcam face tracking or automatic lip sync.
- Alternate hair or outfit packs beyond the default contracts.
- Multiple characters.
- Audio playback or voice synthesis.
- Marketplace or third-party model import.

The model and player interfaces leave room for future VTuber and appearance
adapters, but no speculative feature may block the website MVP.

## Future path

After MVP:

1. Add reviewed alternate hair, outfit, pose, and scene packs.
2. Add an optional VTuber input adapter that maps tracking landmarks to drive().
3. Add microphone-derived mouth controls outside the player.
4. Add recording and transparent-background output.
5. Add a second public consumer only after the v1 interface and license are
   explicitly approved.

The private repository remains the source of truth for Milim production inputs
and releases. The public player repository remains the source of truth for the
runtime and stable player API.
