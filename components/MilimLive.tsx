"use client";

/*
 * MilimLive — thin React/Next client wrapper around the framework-agnostic
 * milim-live2d-model runtime (vendored in lib/milim-live2d, MIT; adapted from
 * Stretchy Studio). This component owns only the *hero concerns* — it never
 * reimplements runtime logic:
 *   - reduced-motion: if the user prefers reduced motion, render the static
 *     sprite and never start the WebGL loop.
 *   - progressive enhancement: the <Image> fallback is the no-JS / no-WebGL /
 *     load-failure surface; the canvas is layered over it only once live.
 *   - perf budget: pause when scrolled offscreen (IntersectionObserver) or the
 *     tab is hidden (visibilitychange).
 *   - lazy: the runtime + scene bundle are dynamically imported after first
 *     paint, so they never block the hero's initial render.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { pickTooltip, tooltipToHtml, TOOLTIPS, type Tooltip } from "@/components/MilimPet/tooltips";
import { onMilim, MILIM_EVENTS } from "@/lib/milim-bridge";

type MilimStage = {
  play: () => void;
  pause: () => void;
  destroy: () => void;
  resize: () => void;
  setPointer: (nx: number, ny: number) => void;
};

export interface MilimLiveProps {
  /** Static sprite shown as the fallback / reduced-motion / pre-hydration surface. */
  fallbackSrc: string;
  fallbackAlt: string;
  /** URL of the scene bundle (scene JSON; textures resolved relative to it). */
  sceneUrl?: string;
  width: number;
  height: number;
  sizes?: string;
  caption?: string;
  /**
   * When true (home page only), render the hero speech bubble and cycle the
   * `home` tooltip pool while the hero is the active Milim. Driven by the
   * heroVisible / heroHidden bridge events fired by <HeroMilimBridge>.
   */
  enableTooltips?: boolean;
}

export default function MilimLive({
  fallbackSrc,
  fallbackAlt,
  sceneUrl = "/live2d/milim/v1/milim.scene.json",
  width,
  height,
  sizes,
  caption = "2.5D IDLE / STATIC FALLBACK READY",
  enableTooltips = false,
}: MilimLiveProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<MilimStage | null>(null);
  // "live" flips true only once the WebGL stage has actually mounted a frame,
  // so the fallback <Image> stays visible until we know rendering succeeded.
  const [live, setLive] = useState(false);

  // ── Hero tooltip layer (home page only) ──────────────────────────────────
  // heroActive tracks whether *this* Milim is the one on stage. Starts false;
  // <HeroMilimBridge> flips it via heroVisible / heroHidden once it measures
  // the initial intersection state.
  const [heroActive, setHeroActive] = useState(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const bubbleTextRef = useRef<HTMLParagraphElement | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTipRef = useRef<Tooltip | null>(null);

  useEffect(() => {
    // Respect reduced-motion: never boot the loop; the static sprite stands in.
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (rm.matches) return;

    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let onVisibility: (() => void) | null = null;
    let onResize: (() => void) | null = null;
    let onPointer: ((e: PointerEvent) => void) | null = null;
    let visible = true;
    let hidden = false;

    const sync = () => {
      const stage = stageRef.current;
      if (!stage) return;
      if (visible && !hidden) stage.play();
      else stage.pause();
    };

    (async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Dynamic import after first paint — keeps the runtime out of the
        // initial hero bundle. (First use of this pattern in-repo.)
        const [{ createMilimStage }, { loadSceneBundle }] = await Promise.all([
          import("@/lib/milim-live2d/stage.js"),
          import("@/lib/milim-live2d/loader.js"),
        ]);
        const { scene, textures } = await loadSceneBundle(sceneUrl);
        if (cancelled) return;

        const stage = createMilimStage(canvas, {
          scene,
          textures,
          autoplay: false,
        }) as MilimStage;
        stageRef.current = stage;
        stage.resize();
        setLive(true);

        // Pause when offscreen.
        io = new IntersectionObserver(
          (entries) => {
            visible = entries.some((e) => e.isIntersecting);
            sync();
          },
          { threshold: 0.05 },
        );
        if (wrapRef.current) io.observe(wrapRef.current);

        // Pause when the tab is hidden.
        onVisibility = () => {
          hidden = document.hidden;
          sync();
        };
        document.addEventListener("visibilitychange", onVisibility);

        onResize = () => stage.resize();
        window.addEventListener("resize", onResize);

        // Look-at follows the pointer over the hero.
        onPointer = (e: PointerEvent) => {
          const el = canvasRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          stage.setPointer(
            Math.max(-1, Math.min(1, nx)),
            Math.max(-1, Math.min(1, ny)),
          );
        };
        window.addEventListener("pointermove", onPointer, { passive: true });

        sync();
      } catch (err) {
        // Any failure (no WebGL2, missing bundle, decode error) → keep the
        // static sprite. The hero is fully functional without the live stage.
        if (process.env.NODE_ENV !== "production") {
          console.warn("[MilimLive] falling back to static sprite:", err);
        }
        setLive(false);
      }
    })();

    return () => {
      cancelled = true;
      if (io) io.disconnect();
      if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
      if (onResize) window.removeEventListener("resize", onResize);
      if (onPointer) window.removeEventListener("pointermove", onPointer);
      if (stageRef.current) {
        stageRef.current.destroy();
        stageRef.current = null;
      }
    };
  }, [sceneUrl]);

  // ── Bridge subscription: who is the active Milim? ────────────────────────
  useEffect(() => {
    if (!enableTooltips) return;
    const offVisible = onMilim(MILIM_EVENTS.heroVisible, () => setHeroActive(true));
    const offHidden = onMilim(MILIM_EVENTS.heroHidden, () => setHeroActive(false));
    return () => {
      offVisible();
      offHidden();
    };
  }, [enableTooltips]);

  // ── Tooltip cycle: mirrors the pet's cadence, but only while hero-active ──
  useEffect(() => {
    if (!enableTooltips) return;

    const HELLO_DELAY = 1_400;
    const CYCLE_MIN = 8_000;
    const CYCLE_MAX = 15_000;
    const TIP_HOLD = 6_500;

    const clearTimers = () => {
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      tipTimerRef.current = null;
      hideTimerRef.current = null;
    };

    const hide = () => {
      const b = bubbleRef.current;
      if (b) b.hidden = true;
    };

    const show = (t: Tooltip) => {
      const b = bubbleRef.current;
      const p = bubbleTextRef.current;
      if (!b || !p || document.hidden) return;
      // Re-trigger the pop-in animation each time.
      p.innerHTML = tooltipToHtml(t);
      b.hidden = false;
      b.style.animation = "none";
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      b.offsetHeight; // force reflow so the animation replays
      b.style.animation = "";
      lastTipRef.current = t;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(hide, TIP_HOLD);
    };

    const scheduleCycle = () => {
      const delay = CYCLE_MIN + Math.random() * (CYCLE_MAX - CYCLE_MIN);
      tipTimerRef.current = setTimeout(() => {
        if (!document.hidden) show(pickTooltip(TOOLTIPS.home, lastTipRef.current));
        scheduleCycle();
      }, delay);
    };

    if (!heroActive) {
      clearTimers();
      hide();
      return;
    }

    // Activate: greet after a beat, then cycle.
    tipTimerRef.current = setTimeout(() => {
      show(pickTooltip(TOOLTIPS.home, lastTipRef.current));
      scheduleCycle();
    }, HELLO_DELAY);

    return () => clearTimers();
  }, [enableTooltips, heroActive]);

  return (
    <div
      className="live-stage"
      ref={wrapRef}
      data-transition-src={fallbackSrc}
      aria-label="Milim is represented by a decorative, code-driven 2.5D idle character."
    >
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="spark-field" aria-hidden="true">✦ · ✦ · ✦</div>
      <div className="sprite-reflection" aria-hidden="true" />
      {/* Static sprite: the fallback surface. Stays visible until the live
          canvas confirms a successful mount, then fades out via [data-live]. */}
      <Image
        className="milim-sprite"
        src={fallbackSrc}
        alt={fallbackAlt}
        width={width}
        height={height}
        priority
        sizes={sizes}
        data-live={live ? "hidden" : "shown"}
      />
      {/* Live canvas: decorative (the descriptive caption + fallback carry a11y). */}
      <canvas ref={canvasRef} className="milim-live-canvas" aria-hidden="true" data-live={live ? "shown" : "hidden"} />
      {enableTooltips && (
        <div
          className="milim-hero-bubble"
          role="status"
          aria-live="polite"
          ref={bubbleRef}
          hidden
        >
          <p ref={bubbleTextRef} />
          <span className="milim-hero-bubble-tail" aria-hidden="true" />
        </div>
      )}
      <p className="sprite-caption">{caption}</p>
    </div>
  );
}
