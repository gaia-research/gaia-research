"use client";

/**
 * components/HeroMilimBridge.tsx
 *
 * The orchestrator for the "one Milim at a time" system. Renders null and is
 * mounted only on the home page. It watches the hero <MilimLive> stage with an
 * IntersectionObserver and coordinates the hand-off between the hero Milim and
 * the corner pet Milim so exactly one is ever the "active" character:
 *
 *   hero in view   →  hero shows tooltips, pet hidden
 *   hero scrolls out → fly-morph Milim down to the corner pet
 *   scroll back up   → fly-morph Milim back up to the hero
 *
 * Nothing here touches React state — every side effect is an emitted bridge
 * event or a direct DOM flourish, so it composes with the independently-mounted
 * <MilimLive> and <MilimPet> islands.
 */

import { useEffect, useRef } from "react";
import {
  emitMilim,
  onMilim,
  MILIM_EVENTS,
  type MilimDirection,
} from "@/lib/milim-bridge";
import { captureHeroTransitionFrame, flyMilim } from "@/lib/milim-transition";
import { isHeroVisibleAtThreshold } from "@/lib/milim-live-runtime";
import {
  pickTooltip,
  tooltipToHtml,
  TRANSITION_TO_HERO,
  TRANSITION_TO_PET,
} from "@/components/MilimPet/tooltips";

// Mirror of MilimPet's spritesheet (the fly clone reuses it for the pet layer).
const SHEET_URL = "/assets/pets/milim-gaia-spritesheet.webp";
const DEBOUNCE_MS = 120;
const IO_THRESHOLD = 0.3;

export function HeroMilimBridge() {
  const activeMilim = useRef<"hero" | "pet">("hero");
  const isAnimating = useRef(false);
  const latestHeroVisible = useRef(true);
  const hasInitialized = useRef(false);
  const desiredPetHidden = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelFlyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".live-stage");
    if (!stage) return;

    const reducedMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Transient "leaving Milim" line, written straight to the live bubble ─
    const sayLeaving = (direction: MilimDirection) => {
      const pool = direction === "to-pet" ? TRANSITION_TO_PET : TRANSITION_TO_HERO;
      const html = tooltipToHtml(pickTooltip(pool));
      const sel =
        direction === "to-pet"
          ? { bubble: ".milim-hero-bubble", text: ".milim-hero-bubble p" }
          : { bubble: ".gaia-web-pet__bubble", text: ".gaia-web-pet__bubble-text" };
      const bubble = document.querySelector<HTMLElement>(sel.bubble);
      const text = document.querySelector<HTMLElement>(sel.text);
      if (!bubble || !text) return;
      text.innerHTML = html;
      bubble.hidden = false;
      window.setTimeout(() => {
        // Only auto-hide if it's still our transient line (the owning island
        // may have taken the bubble back over by now).
        if (!bubble.isConnected) return;
        bubble.hidden = true;
      }, 2000);
    };

    // ── Commit the end state for a hand-off ──────────────────────────────────
    const settle = (direction: MilimDirection, rm: boolean) => {
      if (direction === "to-pet") {
        activeMilim.current = "pet";
        desiredPetHidden.current = false;
        emitMilim(MILIM_EVENTS.heroHidden);
        emitMilim(MILIM_EVENTS.petSetHidden, { hidden: false, animate: !rm });
      } else {
        activeMilim.current = "hero";
        desiredPetHidden.current = true;
        emitMilim(MILIM_EVENTS.petSetHidden, { hidden: true, animate: !rm });
        emitMilim(MILIM_EVENTS.heroVisible);
      }
      emitMilim(MILIM_EVENTS.transitionEnd, { direction, reducedMotion: rm });
    };

    // ── Run a full hero⇄pet transition ───────────────────────────────────────
    const runTransition = (direction: MilimDirection) => {
      isAnimating.current = true;
      const rm = reducedMotion();
      emitMilim(MILIM_EVENTS.transitionStart, { direction, reducedMotion: rm });

      // Stop the leaving Milim's own cycle before we borrow its bubble.
      if (direction === "to-pet") emitMilim(MILIM_EVENTS.heroHidden);
      sayLeaving(direction);

      if (rm) {
        // No fly — the CSS opacity transitions provide a gentle crossfade.
        settle(direction, true);
        return;
      }

      const heroSprite = stage.querySelector<HTMLElement>(".milim-sprite");
      const petRoot = document.querySelector<HTMLElement>(".gaia-web-pet");
      if (!heroSprite || !petRoot) {
        settle(direction, false);
        return;
      }

      cancelFlyRef.current = flyMilim({
        direction,
        heroStage: stage,
        heroSprite,
        petRoot,
        petSheetUrl: SHEET_URL,
        heroFrameSrc: captureHeroTransitionFrame(
          stage,
          stage.dataset.transitionSrc ?? "",
        ),
        reducedMotion: false,
        onComplete: () => {
          cancelFlyRef.current = null;
          settle(direction, false);
        },
      });
    };

    // ── IntersectionObserver on the hero stage ───────────────────────────────
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        const heroVisible = isHeroVisibleAtThreshold(entry, IO_THRESHOLD);
        latestHeroVisible.current = heroVisible;

        // First fire: adopt the state instantly, no animation.
        if (!hasInitialized.current) {
          hasInitialized.current = true;
          if (heroVisible) {
            activeMilim.current = "hero";
            desiredPetHidden.current = true;
            emitMilim(MILIM_EVENTS.petSetHidden, { hidden: true, animate: false });
            emitMilim(MILIM_EVENTS.heroVisible);
          } else {
            activeMilim.current = "pet";
            desiredPetHidden.current = false;
            emitMilim(MILIM_EVENTS.heroHidden);
            emitMilim(MILIM_EVENTS.petSetHidden, { hidden: false, animate: false });
          }
          return;
        }

        // Subsequent fires: debounce, guard against overlap, then transition.
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (isAnimating.current) return;
          const want: "hero" | "pet" = latestHeroVisible.current ? "hero" : "pet";
          if (want === activeMilim.current) return;
          runTransition(want === "pet" ? "to-pet" : "to-hero");
        }, DEBOUNCE_MS);
      },
      { threshold: IO_THRESHOLD },
    );
    io.observe(stage);

    // ── Async pet-mount handshake ────────────────────────────────────────────
    // The pet mounts lazily; if it boots after our initial emit it would miss
    // the desired hidden state, so replay it whenever it announces readiness.
    const offPetReady = onMilim(MILIM_EVENTS.petReady, () => {
      emitMilim(MILIM_EVENTS.petSetHidden, {
        hidden: desiredPetHidden.current,
        animate: false,
      });
    });

    // ── Post-flight reconciliation ───────────────────────────────────────────
    // If the user reversed direction mid-flight, the latest intent may diverge
    // from where we landed — catch up with one more transition.
    const offTransitionEnd = onMilim(MILIM_EVENTS.transitionEnd, () => {
      isAnimating.current = false;
      const want: "hero" | "pet" = latestHeroVisible.current ? "hero" : "pet";
      if (want !== activeMilim.current) {
        runTransition(want === "pet" ? "to-pet" : "to-hero");
      }
    });

    return () => {
      io.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      offPetReady();
      offTransitionEnd();
      cancelFlyRef.current?.();
      cancelFlyRef.current = null;
      // Restore the pet on route change so it's never left stuck hidden.
      emitMilim(MILIM_EVENTS.petSetHidden, { hidden: false, animate: false });
    };
  }, []);

  return null;
}
