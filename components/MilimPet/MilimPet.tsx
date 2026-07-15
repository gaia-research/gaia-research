"use client";
/**
 * components/MilimPet/MilimPet.tsx
 *
 * Thin React wrapper around the WebPet sprite engine (lib/pet-sprite.js).
 * Uses the real Milim+Gaia duo spritesheet from gaia-research/pets.
 *
 * The WebPet class owns all DOM manipulation (sprite, drag, minimize, size).
 * This component owns:
 *  · lifecycle (mount / destroy on unmount)
 *  · page-aware tooltip cycling
 *  · event reactivity (isc:fused, milim:page-event)
 *  · bored-state detection
 *  · visibility-aware pause
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { type WebPet } from "@/lib/pet-sprite";
import {
  contextFromPathname,
  FUSE_REACTIONS,
  GENERIC_EVENT_REACTIONS,
  pickTooltip,
  tooltipToHtml,
  Tooltip,
  TOOLTIPS,
  TOPIC_REACTIONS,
  type PageContext,
} from "./tooltips";

// ─── Constants ────────────────────────────────────────────────────────────────

const SHEET_URL   = "/assets/pets/milim-gaia-spritesheet.webp";
const STORAGE_KEY = "milim-pet:v1";
const CYCLE_MIN   = 8_000;
const CYCLE_MAX   = 15_000;
const TIP_HOLD    = 6_500;
const BORED_AFTER = 60_000;
const REACT_HOLD  = 4_000;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MilimPetProps {
  /** Override auto-detected page context (optional). */
  pageContext?: PageContext;
  /** Disable entirely. */
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MilimPet({ pageContext: pageContextProp, disabled }: MilimPetProps) {
  const rootRef     = useRef<HTMLDivElement | null>(null);
  const petRef      = useRef<WebPet | null>(null);
  const contextRef  = useRef<PageContext>("home");
  const lastTipRef  = useRef<Tooltip | null>(null);
  const cycleRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boredRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();
  // Keep contextRef live across renders without re-triggering the main effect
  contextRef.current = pageContextProp ?? contextFromPathname(pathname);

  useEffect(() => {
    if (disabled) return;
    const el = rootRef.current;
    if (!el) return;

    let cancelled = false;

    // ── Helpers ────────────────────────────────────────────────────────────

    const say = (t: Tooltip, holdMs = TIP_HOLD) => {
      const pet = petRef.current;
      if (!pet || document.hidden) return;
      clearTimeout(hideRef.current!);
      pet.say(tooltipToHtml(t));
      lastTipRef.current = t;
      hideRef.current = setTimeout(() => pet.hideBubble(), holdMs);
    };

    const resetBored = () => {
      clearTimeout(boredRef.current!);
      boredRef.current = setTimeout(() => {
        const pet = petRef.current;
        if (!pet) return;
        pet.setState("waiting");
        say(pickTooltip(TOOLTIPS.idle, lastTipRef.current), TIP_HOLD + 1000);
        setTimeout(() => { petRef.current?.setState("idle"); }, 3000);
      }, BORED_AFTER);
    };

    const scheduleCycle = () => {
      const delay = CYCLE_MIN + Math.random() * (CYCLE_MAX - CYCLE_MIN);
      cycleRef.current = setTimeout(() => {
        if (!document.hidden) {
          say(pickTooltip(TOOLTIPS[contextRef.current], lastTipRef.current));
        }
        scheduleCycle();
      }, delay);
    };

    // ── Mount WebPet ────────────────────────────────────────────────────────
    import("@/lib/pet-sprite").then(({ WebPet }) => {
      if (cancelled || !rootRef.current) return;
      const pet = new WebPet(rootRef.current, {
        sheetUrl: SHEET_URL,
        scale: 0.65,
        storageKey: STORAGE_KEY,
        tooltipDuration: 0, // we manage the hide timer ourselves
        trackPointer: true,
        initialState: "idle",
      });
      petRef.current = pet;

      // Initial greeting after a short beat
      setTimeout(() => {
        if (cancelled) return;
        say(pickTooltip(TOOLTIPS[contextRef.current], null));
        scheduleCycle();
        resetBored();
      }, 1400);
    });

    // ── Craft fusion events ─────────────────────────────────────────────────
    const onFused = (e: Event) => {
      const pet = petRef.current;
      if (!pet) return;
      const detail = (e as CustomEvent).detail as
        | { canonical?: boolean; firstDiscovery?: boolean; builderUnlock?: boolean }
        | undefined;
      const big = !!(detail?.canonical || detail?.firstDiscovery || detail?.builderUnlock);

      clearTimeout(cycleRef.current!); // pause cycling during reaction
      clearTimeout(hideRef.current!);

      if (big) {
        pet.setState("jumping");
        say(pickTooltip(TOOLTIPS.celebrate, lastTipRef.current), REACT_HOLD + 1500);
        setTimeout(() => { petRef.current?.setState("waving"); }, 1200);
        setTimeout(() => {
          petRef.current?.setState("idle");
          scheduleCycle();
        }, 3500);
      } else {
        pet.setState("waving");
        say(pickTooltip(FUSE_REACTIONS, lastTipRef.current), REACT_HOLD);
        setTimeout(() => {
          petRef.current?.setState("idle");
          scheduleCycle();
        }, 2200);
      }
      resetBored();
    };

    // ── Generic page events ─────────────────────────────────────────────────
    const onPageEvent = (e: Event) => {
      const pet = petRef.current;
      if (!pet) return;
      const detail = (e as CustomEvent).detail as { topic?: string } | undefined;
      const topic = detail?.topic ?? "";
      const pool = TOPIC_REACTIONS[topic] ?? GENERIC_EVENT_REACTIONS;

      clearTimeout(cycleRef.current!);
      pet.setState("review");
      say(pickTooltip(pool, lastTipRef.current), REACT_HOLD);
      setTimeout(() => {
        petRef.current?.setState("idle");
        scheduleCycle();
      }, 2800);
      resetBored();
    };

    window.addEventListener("isc:fused", onFused);
    window.addEventListener("milim:page-event", onPageEvent);

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelled = true;
      clearTimeout(cycleRef.current!);
      clearTimeout(boredRef.current!);
      clearTimeout(hideRef.current!);
      window.removeEventListener("isc:fused", onFused);
      window.removeEventListener("milim:page-event", onPageEvent);
      petRef.current?.destroy();
      petRef.current = null;
    };
  // Run once — contextRef is a ref so context changes are picked up without re-mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  if (disabled) return null;

  // The root div is fully managed by WebPet after mount.
  // React renders an empty div; WebPet fills it via innerHTML.
  return <div ref={rootRef} />;
}
