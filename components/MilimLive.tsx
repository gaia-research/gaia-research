"use client";

/*
 * MilimLive — the hero Milim. Milim is a Rive character; this component owns
 * only the page concerns around her and never animates her itself:
 *   - progressive enhancement: the poster <Image> (a frame rendered from the
 *     same rig) is the no-JS / reduced-motion / load-failure surface; the
 *     canvas fades in over it only once Rive has drawn a frame.
 *   - reduced motion: the runtime is never loaded; the poster stands in.
 *   - lifecycle: paused when offscreen, when the tab is hidden, and while the
 *     corner pet is the active Milim (HeroMilimBridge sets data-dormant).
 *   - behaviour: pointer-follow gaze, a greeting with the hello bubble, small
 *     reactions to her own tooltips, and a poke button for keyboard + touch.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { pickTooltip, tooltipToHtml, TOOLTIPS, type Tooltip } from "@/components/MilimPet/tooltips";
import { onMilim, MILIM_EVENTS } from "@/lib/milim-bridge";
import { MILIM_RIVE } from "@/lib/milim-rive/asset";
import type { MilimCharacter } from "@/lib/milim-rive/character";

export interface MilimLiveProps {
  fallbackAlt: string;
  /** Static frame; defaults to the poster rendered from the Rive rig. */
  fallbackSrc?: string;
  width?: number;
  height?: number;
  sizes?: string;
  caption?: string;
  /**
   * When true (home page only), render the hero speech bubble and cycle the
   * `home` tooltip pool while the hero is the active Milim. Driven by the
   * heroVisible / heroHidden bridge events fired by <HeroMilimBridge>.
   */
  enableTooltips?: boolean;
}

/** Pick a small reaction that fits what she is saying. */
function reactionFor(t: Tooltip, first: boolean): { gesture?: "greet" | "point"; expression?: "joyful" | "thinking" } {
  if (first) return { gesture: "greet", expression: "joyful" };
  if (t.link) return { gesture: "point" };
  if (t.text.includes("?")) return { expression: "thinking" };
  if (t.text.includes("!")) return { expression: "joyful" };
  return {};
}

export default function MilimLive({
  fallbackAlt,
  fallbackSrc = MILIM_RIVE.poster.src,
  width = MILIM_RIVE.poster.width,
  height = MILIM_RIVE.poster.height,
  sizes,
  caption = "MILIM · CHIEF CAPABILITY SCOUT",
  enableTooltips = false,
}: MilimLiveProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const charRef = useRef<MilimCharacter | null>(null);
  const [live, setLive] = useState(false);

  const [heroActive, setHeroActive] = useState(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const bubbleTextRef = useRef<HTMLParagraphElement | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTipRef = useRef<Tooltip | null>(null);

  // ── Boot the Rive character ───────────────────────────────────────────────
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (rm.matches) return;

    let cancelled = false;
    let visible = false;
    let hidden = document.hidden;
    let dormant = false;
    const cleanups: Array<() => void> = [];

    const sync = () => {
      const run = visible && !hidden && !dormant;
      charRef.current?.setRunning(run);
      if (wrapRef.current) wrapRef.current.dataset.running = String(run && !!charRef.current);
    };

    (async () => {
      try {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const { createMilimCharacter } = await import("@/lib/milim-rive/character");
        const character = await createMilimCharacter(canvas, { autonomy: true });
        if (cancelled) return character.destroy();
        charRef.current = character;
        setLive(true);

        const io = new IntersectionObserver((entries) => {
          visible = entries.some((e) => e.isIntersecting);
          sync();
        }, { threshold: 0.02 });
        io.observe(wrap);
        cleanups.push(() => io.disconnect());

        const onVisibility = () => { hidden = document.hidden; sync(); };
        document.addEventListener("visibilitychange", onVisibility);
        cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

        const mo = new MutationObserver(() => { dormant = wrap.dataset.dormant === "true"; sync(); });
        mo.observe(wrap, { attributes: true, attributeFilter: ["data-dormant"] });
        cleanups.push(() => mo.disconnect());

        const ro = new ResizeObserver(() => character.resize());
        ro.observe(canvas);
        cleanups.push(() => ro.disconnect());

        const onRm = () => {
          if (!rm.matches) return;
          character.setRunning(false);
          setLive(false);
        };
        rm.addEventListener("change", onRm);
        cleanups.push(() => rm.removeEventListener("change", onRm));

        // Gaze follows the pointer, normalised around her face.
        const onPointer = (e: PointerEvent) => {
          const r = canvas.getBoundingClientRect();
          const fx = r.left + r.width / 2;
          const fy = r.top + r.height * 0.24;
          const reach = Math.max(260, Math.min(window.innerWidth, window.innerHeight) * 0.55);
          character.look({ x: (e.clientX - fx) / reach, y: (e.clientY - fy) / reach });
        };
        window.addEventListener("pointermove", onPointer, { passive: true });
        cleanups.push(() => window.removeEventListener("pointermove", onPointer));

        sync();
      } catch (err) {
        if (process.env.NODE_ENV !== "production") console.warn("[MilimLive] static fallback:", err);
        setLive(false);
      }
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      charRef.current?.destroy();
      charRef.current = null;
    };
  }, []);

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
    let first = true;

    const clearTimers = () => {
      for (const ref of [tipTimerRef, hideTimerRef, moodTimerRef]) {
        if (ref.current) clearTimeout(ref.current);
        ref.current = null;
      }
    };

    const hide = () => {
      const b = bubbleRef.current;
      if (b) b.hidden = true;
    };

    const react = (t: Tooltip) => {
      const c = charRef.current;
      if (!c) return;
      const { gesture, expression } = reactionFor(t, first);
      first = false;
      if (gesture) c.perform(gesture);
      if (expression) {
        c.expression(expression);
        if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
        moodTimerRef.current = setTimeout(() => charRef.current?.expression("neutral"), 3_200);
      }
    };

    const show = (t: Tooltip) => {
      const b = bubbleRef.current;
      const p = bubbleTextRef.current;
      if (!b || !p || document.hidden) return;
      p.innerHTML = tooltipToHtml(t);
      b.hidden = false;
      b.style.animation = "none";
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      b.offsetHeight; // force reflow so the animation replays
      b.style.animation = "";
      lastTipRef.current = t;
      react(t);
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

    tipTimerRef.current = setTimeout(() => {
      show(pickTooltip(TOOLTIPS.home, lastTipRef.current));
      scheduleCycle();
    }, HELLO_DELAY);

    return () => clearTimers();
  }, [enableTooltips, heroActive]);

  // ── Poke: keyboard- and touch-friendly way to get a reaction ─────────────
  const pokes = useRef(0);
  const poke = () => {
    const c = charRef.current;
    if (!c) return;
    const n = pokes.current++;
    c.expression("surprised");
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    moodTimerRef.current = setTimeout(() => {
      const cc = charRef.current;
      if (!cc) return;
      cc.expression("joyful");
      cc.perform(n % 2 === 0 ? "celebrate" : "greet");
      moodTimerRef.current = setTimeout(() => charRef.current?.expression("neutral"), 2_600);
    }, 420);
  };

  return (
    <div className="live-stage" ref={wrapRef} data-transition-src={fallbackSrc} data-live={live ? "shown" : "hidden"}>
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="spark-field" aria-hidden="true">✦ · ✦ · ✦</div>
      <div className="sprite-reflection" aria-hidden="true" />
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
      <canvas ref={canvasRef} className="milim-live-canvas" aria-hidden="true" data-live={live ? "shown" : "hidden"} />
      {live && (
        <button type="button" className="milim-poke" onClick={poke} aria-label="Say hi to Milim" />
      )}
      {enableTooltips && (
        <div className="milim-hero-bubble" role="status" aria-live="polite" ref={bubbleRef} hidden>
          <p ref={bubbleTextRef} />
          <span className="milim-hero-bubble-tail" aria-hidden="true" />
        </div>
      )}
      <p className="sprite-caption">{caption}</p>
    </div>
  );
}
