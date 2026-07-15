"use client";

/*
 * Thin website adapter for one immutable Milim release. React owns browser
 * lifecycle, fallback, pointer normalization, and product-level scene choice;
 * the private player release owns rendering, motion, expressions, physics,
 * compatibility, and every asset path below release.json.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { pickTooltip, tooltipToHtml, TOOLTIPS, type Tooltip } from "@/components/MilimPet/tooltips";
import { onMilim, MILIM_EVENTS } from "@/lib/milim-bridge";
import {
  loadMilimRelease,
  type MilimController,
  type MilimExpression,
} from "@/lib/milim-player-loader";

const DEFAULT_RELEASE = "/milim/releases/milim-web-0.1.1/release.json";
const SCENES = [
  { id: "cyber-slime-lab-v1", short: "LAB", label: "Cyber-Slime Laboratory" },
  { id: "slime-reactor-halo-v1", short: "HALO", label: "Slime Reactor Halo" },
  { id: "dragon-signal-observatory-v1", short: "SIGNAL", label: "Dragon Signal Observatory" },
] as const;
const EXPRESSIONS: MilimExpression[] = [
  "joyful-winker",
  "demon-lord-smirk",
  "starry-awe",
  "chaos-gremlin",
];

export interface MilimLiveProps {
  /** Static sprite shown as the fallback / reduced-motion / pre-hydration surface. */
  fallbackSrc: string;
  fallbackAlt: string;
  /** Immutable promoted release manifest. */
  releaseUrl?: string;
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
  releaseUrl = DEFAULT_RELEASE,
  width,
  height,
  sizes,
  caption = "2.5D IDLE / STATIC FALLBACK READY",
  enableTooltips = false,
}: MilimLiveProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<MilimController | null>(null);
  const [live, setLive] = useState(false);
  const [activeScene, setActiveScene] = useState<(typeof SCENES)[number]["id"]>(
    "cyber-slime-lab-v1",
  );

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
    let onPointer: ((e: PointerEvent) => void) | null = null;
    let expressionTimer: ReturnType<typeof setInterval> | null = null;
    let greetTimer: ReturnType<typeof setTimeout> | null = null;
    let visible = true;
    let hidden = false;

    const sync = () => {
      const stage = stageRef.current;
      if (!stage) return;
      stage.setRunning(visible && !hidden);
    };

    (async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { mountMilim } = await loadMilimRelease(releaseUrl);
        if (cancelled) return;

        const stage = await mountMilim(canvas, {
          src: releaseUrl,
          reducedMotion: false,
          onStatus(event) {
            if (
              !cancelled &&
              typeof event === "object" &&
              event !== null &&
              "type" in event &&
              event.type === "decoded"
            ) {
              setLive(true);
            }
          },
        });
        if (cancelled) {
          stage.destroy();
          return;
        }
        stageRef.current = stage;

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

        // Look-at follows the pointer over the hero through semantic controls.
        onPointer = (e: PointerEvent) => {
          const el = canvasRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          stage.drive({
            gaze: {
              x: Math.max(-1, Math.min(1, nx)),
              y: Math.max(-1, Math.min(1, ny)),
            },
          });
        };
        window.addEventListener("pointermove", onPointer, { passive: true });

        let expressionIndex = 0;
        expressionTimer = setInterval(() => {
          expressionIndex = (expressionIndex + 1) % EXPRESSIONS.length;
          stage.set({ expression: EXPRESSIONS[expressionIndex] });
        }, 9_000);
        greetTimer = setTimeout(() => void stage.perform("greet"), 900);

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
      if (onPointer) window.removeEventListener("pointermove", onPointer);
      if (expressionTimer) clearInterval(expressionTimer);
      if (greetTimer) clearTimeout(greetTimer);
      if (stageRef.current) {
        stageRef.current.destroy();
        stageRef.current = null;
      }
    };
  }, [releaseUrl]);

  const chooseScene = (scene: (typeof SCENES)[number]["id"]) => {
    const result = stageRef.current?.set({ scene }) as { ok?: boolean } | undefined;
    if (result?.ok === false) return;
    setActiveScene(scene);
  };

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
      data-player={live ? "ready" : "fallback"}
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
      {live && (
        <div className="milim-scene-picker" role="group" aria-label="Milim background scene">
          {SCENES.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              className="milim-scene-choice"
              aria-label={`Scene ${index + 1}: ${scene.label}`}
              aria-pressed={activeScene === scene.id}
              onClick={() => chooseScene(scene.id)}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {scene.short}
            </button>
          ))}
        </div>
      )}
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
