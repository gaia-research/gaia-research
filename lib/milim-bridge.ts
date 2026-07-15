/**
 * lib/milim-bridge.ts
 *
 * Event contract for the "one Milim at a time" system. A tiny, typed
 * window-CustomEvent bus that lets three independently-mounted islands —
 * the hero <MilimLive> (home only), the global <MilimPet>, and the
 * <HeroMilimBridge> orchestrator — coordinate without prop-drilling or a
 * shared React tree.
 *
 * Contract:
 *   heroVisible / heroHidden  — the hero <MilimLive> stage crossed the IO
 *                               threshold. Drives which Milim is "active".
 *   petReady                  — the async-mounted pet has finished booting;
 *                               lets the orchestrator replay the desired
 *                               hidden state (fixes the mount-order race).
 *   petSetHidden              — command to the pet: hide/show, optionally
 *                               animated.
 *   transitionStart / …End    — bracket a fly-morph so the orchestrator can
 *                               guard against overlapping transitions.
 */

export const MILIM_EVENTS = {
  heroVisible:     "milim:hero-visible",
  heroHidden:      "milim:hero-hidden",
  petReady:        "milim:pet-ready",
  petSetHidden:    "milim:pet-set-hidden",
  transitionStart: "milim:transition-start",
  transitionEnd:   "milim:transition-end",
} as const;

export type MilimDirection = "to-pet" | "to-hero";

export interface PetSetHiddenDetail  { hidden: boolean; animate: boolean; }
export interface TransitionDetail    { direction: MilimDirection; reducedMotion: boolean; }

export function emitMilim<T>(name: string, detail?: T): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function onMilim<T>(
  name: string,
  fn: (detail: T) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => fn((e as CustomEvent<T>).detail);
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}
