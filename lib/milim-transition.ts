/**
 * lib/milim-transition.ts
 *
 * The fly-morph engine for the "one Milim at a time" system. When the hero
 * scrolls out (or back in), we don't cut between the two Milims — we fly a
 * throwaway clone from one to the other using a FLIP-style transform and a
 * mid-flight art crossfade (hero full-body sprite ⇄ corner pet sprite).
 *
 * The clone is a single position:fixed element that starts exactly over the
 * *source* Milim, then transitions its transform to land exactly over the
 * *target* Milim. Two stacked background layers (hero art / pet art) crossfade
 * partway through so it reads as Milim morphing between her two forms.
 *
 * Ownership contract:
 *   · The source Milim is hidden at flight start (hero → data-dormant on the
 *     stage; pet → data-hero-hidden on its root) so only the clone is visible.
 *   · The target Milim is revealed on completion.
 *   · onComplete() lets <HeroMilimBridge> emit the bridge events that settle
 *     tooltip/cycle state and drive post-flight reconciliation.
 *
 * TODO(live2d): when the hero becomes a Live2D canvas, prefer
 * `canvas.toDataURL()` as the hero layer source over `data-transition-src`
 * (the static sprite) so the morph starts from the exact rendered frame.
 */

// Pet spritesheet geometry (mirror of lib/pet-sprite.js).
const CELL_W = 192;
const CELL_H = 208;
const ATLAS_W = 1536; // = CELL_W * 8 (8 columns)
const ATLAS_H = 2288; // = CELL_H * 11 (11 rows)

export interface FlyOptions {
  direction: "to-pet" | "to-hero";
  heroStage: HTMLElement;
  heroSprite: HTMLElement;
  petRoot: HTMLElement;
  petSheetUrl: string;
  reducedMotion: boolean;
  onComplete: () => void;
}

export function flyMilim(opts: FlyOptions): () => void {
  const { direction, heroStage, heroSprite, petRoot, petSheetUrl, reducedMotion, onComplete } = opts;

  const toPet = direction === "to-pet";
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const dur = toPet ? (isMobile ? 500 : 700) : isMobile ? 380 : 550;
  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";

  // ── Source-hide / target-show helpers ────────────────────────────────────
  // Hero source freezes via [data-dormant]; pet source hides via
  // [data-hero-hidden]. Reversed for the target on landing.
  const hideSource = () => {
    if (toPet) heroStage.dataset.dormant = "true";
    else petRoot.dataset.heroHidden = "true";
  };
  const showTarget = () => {
    if (toPet) {
      petRoot.dataset.heroHidden = "false";
      petRoot.classList.add("milim-landing");
      window.setTimeout(() => petRoot.classList.remove("milim-landing"), 400);
    } else {
      delete heroStage.dataset.dormant;
    }
  };

  // Reduced motion (defensive — the orchestrator normally skips flyMilim):
  // snap straight to the end state, no clone.
  if (reducedMotion) {
    hideSource();
    showTarget();
    onComplete();
    return () => {};
  }

  // ── Clone state ────────────────────────────────────────────────────────────
  let clone: HTMLDivElement | null = null;
  let done = false;
  let fallbackTimer = 0;
  let crossfadeTimer = 0;
  let rafId = 0;
  // to-hero scroll-settle tracking
  let scrollSettleTimer = 0;
  let scrollListener: (() => void) | null = null;

  const cleanupClone = () => {
    if (crossfadeTimer) window.clearTimeout(crossfadeTimer);
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(scrollSettleTimer);
    if (scrollListener) {
      window.removeEventListener("scroll", scrollListener);
      scrollListener = null;
    }
    if (clone) {
      clone.removeEventListener("transitionend", onEnd);
      clone.remove();
      clone = null;
    }
  };

  const finish = () => {
    if (done) return;
    done = true;
    cleanupClone();
    showTarget();
    onComplete();
  };

  function onEnd(e: TransitionEvent) {
    // Only the transform transition ends the flight (filter/opacity are noise).
    if (e.propertyName !== "transform") return;
    finish();
  }

  // ── startFlight: hide source + measure on next frame ──────────────────────
  const startFlight = () => {
    if (done) return;
    hideSource();
    rafId = requestAnimationFrame(() => {
    rafId = 0;
    if (done) return;

    const heroRect = heroSprite.getBoundingClientRect();
    const petRect = petRoot.getBoundingClientRect();
    const srcRect = toPet ? heroRect : petRect;
    const dstRect = toPet ? petRect : heroRect;

    // Degenerate geometry (element not laid out) → skip the flourish.
    if (srcRect.width < 1 || srcRect.height < 1 || dstRect.width < 1) {
      finish();
      return;
    }

    // FLIP deltas: clone is created at the source box, then transformed to
    // land on the target box.
    const scale = dstRect.width / srcRect.width;
    const dx = dstRect.left - srcRect.left;
    const dy = dstRect.top - srcRect.top;

    // ── Build the clone ─────────────────────────────────────────────────────
    clone = document.createElement("div");
    clone.className = "milim-fly-clone";
    clone.style.left = `${srcRect.left}px`;
    clone.style.top = `${srcRect.top}px`;
    clone.style.width = `${srcRect.width}px`;
    clone.style.height = `${srcRect.height}px`;
    clone.style.willChange = "transform, opacity, filter";
    clone.style.transform = "translate(0px, 0px) scale(1)";
    clone.style.transformOrigin = "top left";
    if (!isMobile) clone.style.filter = "blur(3px)";

    // Hero layer: the full-body sprite, bottom-anchored (matches the hero's
    // object-position: bottom). Source is data-transition-src on the stage.
    const heroLayer = document.createElement("div");
    heroLayer.className = "fly-layer fly-layer-hero";
    heroLayer.style.backgroundImage = `url("${heroStage.dataset.transitionSrc ?? ""}")`;
    heroLayer.style.opacity = toPet ? "1" : "0";
    heroLayer.style.transition = "opacity 300ms ease";

    // Pet layer: one idle cell (0,0) scaled to fill the clone box. Sizing the
    // atlas proportionally to the clone keeps the sprite crisp in either
    // direction without a compounding inner transform.
    const petLayer = document.createElement("div");
    petLayer.className = "fly-layer fly-layer-pet";
    petLayer.style.backgroundImage = `url("${petSheetUrl}")`;
    petLayer.style.backgroundPosition = "0 0";
    petLayer.style.backgroundSize = `${(srcRect.width / CELL_W) * ATLAS_W}px ${(srcRect.height / CELL_H) * ATLAS_H}px`;
    petLayer.style.opacity = toPet ? "0" : "1";
    petLayer.style.transition = "opacity 300ms ease";

    clone.appendChild(heroLayer);
    clone.appendChild(petLayer);
    document.body.appendChild(clone);

    // Force reflow so the initial transform/filter are committed before we
    // set the target values (otherwise the browser collapses both frames).
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    clone.offsetHeight;

    // ── Kick off the flight ───────────────────────────────────────────────
    const filterPart = isMobile ? "" : `, filter ${dur}ms ${ease}`;
    clone.style.transition = `transform ${dur}ms ${ease}${filterPart}`;
    clone.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    if (!isMobile) clone.style.filter = "blur(0px)";

    clone.addEventListener("transitionend", onEnd);

    // Mid-flight art crossfade. On desktop this fires at the plan's 250ms; on
    // the shorter mobile flights we scale it in so it still completes in view.
    const crossfadeAt = isMobile ? Math.round(dur * 0.35) : 250;
    crossfadeTimer = window.setTimeout(() => {
      if (done || !clone) return;
      heroLayer.style.opacity = toPet ? "0" : "1";
      petLayer.style.opacity = toPet ? "1" : "0";
    }, crossfadeAt);

    // Safety net: some engines drop transitionend if the element is GC'd or
    // the tab was backgrounded mid-flight.
    fallbackTimer = window.setTimeout(finish, dur + 120);
    }); // end requestAnimationFrame
  }; // end startFlight

  // ── Kick off ───────────────────────────────────────────────────────────────
  if (toPet) {
    // Hero is leaving — scroll has stopped (user just scrolled down past it).
    // Measure immediately.
    startFlight();
  } else {
    // to-hero: user is mid-scroll upward. The hero rect is still moving as
    // the page scrolls; measuring now would target a position too high.
    // Wait for 100ms of scroll silence before hiding the source + measuring.
    const SETTLE_MS = 100;
    const resetTimer = () => {
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(() => {
        if (scrollListener) {
          window.removeEventListener("scroll", scrollListener);
          scrollListener = null;
        }
        startFlight();
      }, SETTLE_MS);
    };
    scrollListener = resetTimer;
    window.addEventListener("scroll", scrollListener, { passive: true });
    resetTimer(); // also start immediately in case scroll is already stopped
  }

  // cancel(): reconcile / unmount path — tear down the clone and snap to the
  // correct end state without a second onComplete.
  return () => {
    if (done) return;
    done = true;
    cleanupClone();
    showTarget();
  };
}
