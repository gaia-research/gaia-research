"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { pickTooltip, tooltipToHtml, TOOLTIPS, type Tooltip } from "@/components/MilimPet/tooltips";
import { onMilim, MILIM_EVENTS } from "@/lib/milim-bridge";
import {
  createCoalescedMilimPointerDriver,
  resolveMilimRunning,
  shouldMountMilimPlayer,
  type MilimLiveMode,
} from "@/lib/milim-live-runtime";
import {
  loadMilimRelease,
  type MilimController,
  type MilimDurableState,
} from "@/lib/milim-player-loader";

/** This path is intentionally inert until a fresh, locked compatibility-2 release is promoted. */
export const MILIM_RELEASE_VERSION = "milim-web-0.2.0";
export const MILIM_RELEASE_URL = `/milim/releases/${MILIM_RELEASE_VERSION}/release.json`;

export type { MilimLiveMode } from "@/lib/milim-live-runtime";
export type MilimLifecycle = { running: boolean; visible: boolean; documentHidden: boolean };

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface MilimLiveProps {
  fallbackSrc: string;
  fallbackAlt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  caption?: string;
  enableTooltips?: boolean;
  releaseUrl?: string;
  initialState?: Partial<MilimDurableState>;
  mode?: MilimLiveMode;
  onReady?(controller: MilimController): void;
  onLifecycle?(lifecycle: MilimLifecycle): void;
  onStatus?(status: unknown): void;
}

/**
 * Thin website adapter for the public six-method Milim Player controller.
 * It owns only DOM lifecycle, pointer normalization, and static fallbacks;
 * release/model/renderer internals remain behind the promoted module boundary.
 */
export default function MilimLive({
  fallbackSrc,
  fallbackAlt,
  width,
  height,
  sizes,
  className,
  caption = "MILIM · STATIC FALLBACK READY",
  enableTooltips = false,
  releaseUrl = MILIM_RELEASE_URL,
  initialState,
  mode = "live",
  onReady,
  onLifecycle,
  onStatus,
}: MilimLiveProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<MilimController | null>(null);
  const initialStateRef = useRef(initialState);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [playerState, setPlayerState] = useState<"loading" | "ready" | "fallback">(
    mode === "live" ? "loading" : "fallback",
  );

  const [heroActive, setHeroActive] = useState(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const bubbleTextRef = useRef<HTMLParagraphElement | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTipRef = useRef<Tooltip | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(REDUCED_MOTION_QUERY);
    if (!mediaQuery) return;
    const synchronize = () => setPrefersReducedMotion(mediaQuery.matches);
    synchronize();
    mediaQuery.addEventListener("change", synchronize);
    return () => mediaQuery.removeEventListener("change", synchronize);
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion || window.matchMedia?.(REDUCED_MOTION_QUERY).matches === true;
    if (!shouldMountMilimPlayer(mode, reduced)) {
      setPlayerState("fallback");
      return;
    }

    setPlayerState("loading");
    let cancelled = false;
    let visible = true;
    let documentHidden = document.hidden;
    let observer: IntersectionObserver | null = null;
    let pointerTarget: HTMLElement | null = null;
    let pointerDriver: ReturnType<typeof createCoalescedMilimPointerDriver> | null = null;
    const canvas = canvasRef.current;

    const reportLifecycle = () => {
      const running = resolveMilimRunning(visible, documentHidden);
      stageRef.current?.setRunning(running);
      onLifecycle?.({ running, visible, documentHidden });
    };
    const fallback = (status: unknown) => {
      stageRef.current?.destroy();
      stageRef.current = null;
      onStatus?.(status);
      if (!cancelled) setPlayerState("fallback");
    };
    const onVisibilityChange = () => {
      documentHidden = document.hidden;
      reportLifecycle();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      fallback({ type: "context-lost" });
    };

    if (canvas) canvas.addEventListener("webglcontextlost", onContextLost, { passive: false });
    void (async () => {
      try {
        if (!canvas) return;
        const { mountMilim } = await loadMilimRelease(releaseUrl);
        if (cancelled) return;
        const controller = await mountMilim(canvas, {
          src: releaseUrl,
          reducedMotion: false,
          onStatus(status) { onStatus?.(status); },
        });
        if (cancelled) {
          controller.destroy();
          return;
        }
        stageRef.current = controller;
        if (initialStateRef.current) controller.set(initialStateRef.current);
        onReady?.(controller);
        observer = new IntersectionObserver((entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          reportLifecycle();
        }, { threshold: 0.05 });
        if (wrapRef.current) observer.observe(wrapRef.current);
        document.addEventListener("visibilitychange", onVisibilityChange);
        pointerTarget = wrapRef.current;
        if (pointerTarget) {
          pointerDriver = createCoalescedMilimPointerDriver({
            element: canvas,
            drive: controller.drive,
            isActive: () => !cancelled && visible && !documentHidden && stageRef.current === controller,
            requestFrame: window.requestAnimationFrame.bind(window),
            cancelFrame: window.cancelAnimationFrame.bind(window),
          });
          pointerTarget.addEventListener("pointermove", pointerDriver.onPointerMove, { passive: true });
        }
        setPlayerState("ready");
        reportLifecycle();
      } catch (error) {
        fallback({ type: "error", error });
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (canvas) canvas.removeEventListener("webglcontextlost", onContextLost);
      if (pointerTarget && pointerDriver) pointerTarget.removeEventListener("pointermove", pointerDriver.onPointerMove);
      pointerDriver?.destroy();
      stageRef.current?.destroy();
      stageRef.current = null;
    };
  }, [mode, onLifecycle, onReady, onStatus, prefersReducedMotion, releaseUrl]);

  useEffect(() => {
    if (!enableTooltips) return;
    const offVisible = onMilim(MILIM_EVENTS.heroVisible, () => setHeroActive(true));
    const offHidden = onMilim(MILIM_EVENTS.heroHidden, () => setHeroActive(false));
    return () => { offVisible(); offHidden(); };
  }, [enableTooltips]);

  useEffect(() => {
    if (!enableTooltips) return;
    const clearTimers = () => {
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      tipTimerRef.current = null;
      hideTimerRef.current = null;
    };
    const hide = () => { if (bubbleRef.current) bubbleRef.current.hidden = true; };
    const show = (tip: Tooltip) => {
      const bubble = bubbleRef.current;
      const text = bubbleTextRef.current;
      if (!bubble || !text || document.hidden) return;
      text.innerHTML = tooltipToHtml(tip);
      bubble.hidden = false;
      bubble.style.animation = "none";
      bubble.offsetHeight;
      bubble.style.animation = "";
      lastTipRef.current = tip;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(hide, 6_500);
    };
    const schedule = () => {
      tipTimerRef.current = setTimeout(() => {
        if (!document.hidden) show(pickTooltip(TOOLTIPS.home, lastTipRef.current));
        schedule();
      }, 8_000 + Math.random() * 7_000);
    };
    if (!heroActive) { clearTimers(); hide(); return; }
    tipTimerRef.current = setTimeout(() => { show(pickTooltip(TOOLTIPS.home, lastTipRef.current)); schedule(); }, 1_400);
    return clearTimers;
  }, [enableTooltips, heroActive]);

  return (
    <div
      ref={wrapRef}
      className={["live-stage", className].filter(Boolean).join(" ")}
      data-transition-src={fallbackSrc}
      data-player={playerState}
      data-milim-mode={mode}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
      aria-label="Milim is represented by a decorative, code-driven character."
    >
      <div className="orbit orbit-one" aria-hidden="true" />
      <div className="orbit orbit-two" aria-hidden="true" />
      <div className="spark-field" aria-hidden="true">✦ · ✦ · ✦</div>
      <div className="sprite-reflection" aria-hidden="true" />
      <Image className="milim-sprite" src={fallbackSrc} alt={fallbackAlt} width={width} height={height} priority sizes={sizes} data-live={playerState === "ready" ? "hidden" : "shown"} />
      <canvas ref={canvasRef} className="milim-live-canvas" aria-hidden="true" data-live={playerState === "ready" ? "shown" : "hidden"} />
      {enableTooltips && <div className="milim-hero-bubble" role="status" aria-live="polite" ref={bubbleRef} hidden><p ref={bubbleTextRef} /><span className="milim-hero-bubble-tail" aria-hidden="true" /></div>}
      <p className="sprite-caption">{caption}</p>
    </div>
  );
}
