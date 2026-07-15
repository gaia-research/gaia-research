"use client";
/**
 * components/MilimPet/MilimPet.tsx
 *
 * Draggable Milim & Gaia companion — rides every page via the root layout.
 * Auto-detects page context from usePathname(); no per-page wiring needed.
 *
 * Features:
 *  · CSS-only diorama: Milim chibi (left) + Gaia baby dragon (right)
 *  · Speech bubble with Milim-voice tooltips, auto-cycling & page-aware
 *  · Draggable (mouse + touch via Pointer Events), position persisted
 *  · Resizable: sm (70px) / md (110px) / lg (150px)
 *  · Collapsible to a pill button
 *  · Event-reactive: isc:fused (craft), milim:page-event (any page)
 *  · Bored state after 60s idle
 *  · prefers-reduced-motion respected
 *  · Visibility API: pauses while tab hidden
 *  · Keyboard: arrow keys to drag, Esc to collapse
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  contextFromPathname,
  FUSE_REACTIONS,
  GENERIC_EVENT_REACTIONS,
  pickTooltip,
  Tooltip,
  TOOLTIPS,
  TOPIC_REACTIONS,
  type PageContext,
} from "./tooltips";

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = "milim-pet:v1";
const SIZES = ["sm", "md", "lg"] as const;
type PetSize = (typeof SIZES)[number];
const SIZE_PX: Record<PetSize, number> = { sm: 70, md: 110, lg: 150 };
const CYCLE_MIN_MS = 8_000;
const CYCLE_MAX_MS = 15_000;
const TOOLTIP_VISIBLE_MS = 6_500;
const BORED_AFTER_MS = 60_000;
const REACTION_HOLD_MS = 4_200;
const MARGIN = 12;
const KEYBOARD_STEP = 24;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetPrefs {
  x: number | null;
  y: number | null;
  size: PetSize;
  collapsed: boolean;
}

const DEFAULT_PREFS: PetPrefs = { x: null, y: null, size: "md", collapsed: false };

export interface MilimPetProps {
  /** Force a context. When omitted, auto-derived from current pathname. */
  pageContext?: PageContext;
  /** Disable entirely (e.g. feature flag). */
  disabled?: boolean;
}

// ─── Render tooltip with optional inline link ─────────────────────────────────

function renderTooltip(t: Tooltip | null): React.ReactNode {
  if (!t) return null;
  if (!t.link) return t.text;
  const { text, link } = t;
  const i = text.indexOf(link.text);
  if (i === -1) return text;
  const before = text.slice(0, i);
  const after = text.slice(i + link.text.length);
  const external = link.href.startsWith("http");
  return (
    <>
      {before}
      <a
        className="milim-bubble-link"
        href={link.href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {link.text}
      </a>
      {after}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MilimPet({ pageContext: pageContextProp, disabled }: MilimPetProps) {
  const pathname = usePathname();
  const context: PageContext = pageContextProp ?? contextFromPathname(pathname);

  // ── State ────────────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<PetPrefs>(DEFAULT_PREFS);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [bored, setBored] = useState(false);
  const [reactionActive, setReactionActive] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boredTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTooltipRef = useRef<Tooltip | null>(null);
  const pausedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRef = useRef<(() => void) | null>(null);

  // ── Mount + hydrate ───────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PetPrefs>;
        setPrefs((p) => ({ ...p, ...parsed }));
      }
    } catch { /* ignore */ }

    // Reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMqChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onMqChange);
    return () => mq.removeEventListener("change", onMqChange);
  }, []);

  // ── Persist prefs ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
    }, 250);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [prefs, mounted]);

  // ── Tooltip show/hide ─────────────────────────────────────────────────────
  const showTooltip = useCallback((t: Tooltip, holdMs = TOOLTIP_VISIBLE_MS) => {
    if (pausedRef.current) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setTooltip(t);
    setBubbleVisible(true);
    lastTooltipRef.current = t;
    hideTimerRef.current = setTimeout(() => setBubbleVisible(false), holdMs);
  }, []);

  // ── Bored watchdog ────────────────────────────────────────────────────────
  const resetBored = useCallback(() => {
    if (boredTimerRef.current) clearTimeout(boredTimerRef.current);
    setBored(false);
    boredTimerRef.current = setTimeout(() => {
      setBored(true);
      const t = pickTooltip(TOOLTIPS.idle, lastTooltipRef.current);
      showTooltip(t, TOOLTIP_VISIBLE_MS + 1000);
    }, BORED_AFTER_MS);
  }, [showTooltip]);

  // ── Ambient tooltip cycling ───────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || prefs.collapsed) return;

    const pool = TOOLTIPS[context];

    const schedule = () => {
      const delay = CYCLE_MIN_MS + Math.random() * (CYCLE_MAX_MS - CYCLE_MIN_MS);
      cycleTimerRef.current = setTimeout(() => {
        if (!pausedRef.current) {
          const t = pickTooltip(pool, lastTooltipRef.current);
          showTooltip(t);
        }
        schedule();
      }, delay);
    };
    scheduleRef.current = schedule;

    // Initial greeting ~1.2s after mount/context change
    const greetTimer = setTimeout(() => {
      if (!pausedRef.current) {
        showTooltip(pickTooltip(pool, null));
      }
      schedule();
    }, 1200);

    return () => {
      clearTimeout(greetTimer);
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, mounted, prefs.collapsed]);

  // ── Init bored watchdog ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    resetBored();
    return () => { if (boredTimerRef.current) clearTimeout(boredTimerRef.current); };
  }, [mounted, resetBored]);

  // ── Window event listeners (craft fusion, page events) ────────────────────
  useEffect(() => {
    if (!mounted) return;

    const onFused = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { canonical?: boolean; firstDiscovery?: boolean; builderUnlock?: boolean }
        | undefined;
      const big = !!(detail?.canonical || detail?.firstDiscovery || detail?.builderUnlock);

      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);

      if (big) {
        setCelebrating(true);
        setReactionActive(false);
        const t = pickTooltip(TOOLTIPS.celebrate, lastTooltipRef.current);
        showTooltip(t, REACTION_HOLD_MS + 1000);
      } else {
        setReactionActive(true);
        setCelebrating(false);
        const t = pickTooltip(FUSE_REACTIONS, lastTooltipRef.current);
        showTooltip(t, REACTION_HOLD_MS);
      }

      reactionTimerRef.current = setTimeout(() => {
        setReactionActive(false);
        setCelebrating(false);
      }, big ? REACTION_HOLD_MS + 1200 : REACTION_HOLD_MS);

      resetBored();
    };

    const onPageEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail as { topic?: string } | undefined;
      const topic = detail?.topic ?? "";
      const pool = TOPIC_REACTIONS[topic] ?? GENERIC_EVENT_REACTIONS;

      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      setReactionActive(true);
      const t = pickTooltip(pool, lastTooltipRef.current);
      showTooltip(t, REACTION_HOLD_MS);
      reactionTimerRef.current = setTimeout(() => setReactionActive(false), REACTION_HOLD_MS);
      resetBored();
    };

    window.addEventListener("isc:fused", onFused);
    window.addEventListener("milim:page-event", onPageEvent);
    return () => {
      window.removeEventListener("isc:fused", onFused);
      window.removeEventListener("milim:page-event", onPageEvent);
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    };
  }, [mounted, showTooltip, resetBored]);

  // ── Visibility pause ──────────────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      pausedRef.current = document.hidden;
      if (!document.hidden && scheduleRef.current) {
        // Resume: clear old timer and reschedule
        if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
        scheduleRef.current();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // ── Resize clamp ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const onResize = () => {
      if (!wrapRef.current || prefs.x === null) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - MARGIN;
      const maxY = window.innerHeight - rect.height - MARGIN;
      setPrefs((p) => {
        if (p.x === null || p.y === null) return p;
        return {
          ...p,
          x: Math.max(MARGIN, Math.min(p.x, maxX)),
          y: Math.max(MARGIN, Math.min(p.y, maxY)),
        };
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [mounted, prefs.x]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Don't start a drag if the user clicked a button or link
    if ((e.target as Element).closest("button, a")) return;
    e.preventDefault();

    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
    };
    el.setPointerCapture(e.pointerId);
    setDragging(true);
    resetBored();

    const onMove = (me: PointerEvent) => {
      if (!dragStateRef.current) return;
      const { startX, startY, originX, originY } = dragStateRef.current;
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      const elRect = wrapRef.current?.getBoundingClientRect();
      const w = elRect?.width ?? SIZE_PX[prefs.size];
      const h = elRect?.height ?? 160;
      const nextX = Math.max(MARGIN, Math.min(originX + dx, window.innerWidth - w - MARGIN));
      const nextY = Math.max(MARGIN, Math.min(originY + dy, window.innerHeight - h - MARGIN));
      setPrefs((p) => ({ ...p, x: nextX, y: nextY }));
    };

    const onUp = () => {
      dragStateRef.current = null;
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetBored, prefs.size]);

  // ── Keyboard drag ──────────────────────────────────────────────────────────
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (arrows.includes(e.key)) {
      e.preventDefault();
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const baseX = prefs.x ?? rect.left;
      const baseY = prefs.y ?? rect.top;
      const w = rect.width;
      const h = rect.height;
      let nx = baseX;
      let ny = baseY;
      if (e.key === "ArrowLeft")  nx -= KEYBOARD_STEP;
      if (e.key === "ArrowRight") nx += KEYBOARD_STEP;
      if (e.key === "ArrowUp")    ny -= KEYBOARD_STEP;
      if (e.key === "ArrowDown")  ny += KEYBOARD_STEP;
      nx = Math.max(MARGIN, Math.min(nx, window.innerWidth - w - MARGIN));
      ny = Math.max(MARGIN, Math.min(ny, window.innerHeight - h - MARGIN));
      setPrefs((p) => ({ ...p, x: nx, y: ny }));
      resetBored();
    } else if (e.key === "Escape") {
      setPrefs((p) => ({ ...p, collapsed: true }));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const t = pickTooltip(TOOLTIPS[context], lastTooltipRef.current);
      showTooltip(t);
    }
  }, [prefs.x, prefs.y, resetBored, context, showTooltip]);

  // ── Size cycle ─────────────────────────────────────────────────────────────
  const cycleSize = useCallback(() => {
    setPrefs((p) => ({ ...p, size: SIZES[(SIZES.indexOf(p.size) + 1) % 3] }));
    resetBored();
  }, [resetBored]);

  // ── Collapse / expand ──────────────────────────────────────────────────────
  const collapse = useCallback(() => {
    setPrefs((p) => ({ ...p, collapsed: true }));
    setBubbleVisible(false);
  }, []);

  const expand = useCallback(() => {
    setPrefs((p) => ({ ...p, collapsed: false }));
    resetBored();
  }, [resetBored]);

  // ── Positioning style ──────────────────────────────────────────────────────
  const positionStyle: React.CSSProperties =
    prefs.x !== null && prefs.y !== null
      ? { left: prefs.x, top: prefs.y, right: "auto", bottom: "auto" }
      : {};

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (disabled || !mounted) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="milim-pet"
      data-size={prefs.size}
      data-collapsed={prefs.collapsed ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
      data-bored={bored ? "true" : "false"}
      data-reacting={reactionActive ? "true" : "false"}
      data-celebrate={celebrating ? "true" : "false"}
      data-context={context}
      style={positionStyle}
      role="group"
      aria-label="Milim companion. Use arrow keys to move."
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* ── Collapsed pill ──────────────────────────────────────────────── */}
      {prefs.collapsed ? (
        <button
          type="button"
          className="milim-pet-pill"
          onClick={expand}
          aria-label="Show Milim companion"
        >
          <span aria-hidden="true" className="milim-pet-pill-dragon">🐉</span>
          <span className="milim-pet-pill-label">MILIM</span>
        </button>
      ) : (
        <>
          {/* ── Speech bubble ────────────────────────────────────────────── */}
          <div
            className="milim-bubble"
            data-visible={bubbleVisible ? "true" : "false"}
            role="status"
            aria-live="polite"
            aria-hidden={bubbleVisible ? "false" : "true"}
          >
            <p className="milim-bubble-text">{renderTooltip(tooltip)}</p>
            <span className="milim-bubble-tail" aria-hidden="true" />
          </div>

          {/* ── The diorama (drag surface) ───────────────────────────────── */}
          <div
            className="milim-scene"
            onPointerDown={onPointerDown}
            role="img"
            aria-label="Milim Nova and her baby dragon Gaia"
          >
            <div className="milim-scene-inner">

              {/* ── Gaia dragon (right) ────────────────────────────────── */}
              <div className="mp-dragon" aria-hidden="true">
                <span
                  className="mp-dragon-spark"
                  data-show={(reactionActive || celebrating) ? "true" : "false"}
                  aria-hidden="true"
                >
                  {celebrating ? "⭐" : "✦"}
                </span>
                <div className="mp-dragon-body">
                  <div className="mp-dragon-head">
                    <i className="mp-horn-l" /><i className="mp-horn-r" />
                  </div>
                  <div className="mp-wing-l" /><div className="mp-wing-r" />
                  <div className="mp-dragon-torso" />
                  <div className="mp-dragon-tail" />
                </div>
              </div>

              {/* ── Milim chibi (left) ─────────────────────────────────── */}
              <div className="mp-milim" aria-hidden="true">
                <div className="mp-milim-hair-back" />
                <div className="mp-milim-body">
                  <span className="mp-milim-logo" />
                </div>
                <div className="mp-milim-legs">
                  <i className="mp-leg-l" /><i className="mp-leg-r" />
                </div>
                <div className="mp-milim-head">
                  <i className="mp-star mp-star-l" /><i className="mp-star mp-star-r" />
                  <i className="mp-eye mp-eye-l" /><i className="mp-eye mp-eye-r" />
                  <i className="mp-blush mp-blush-l" /><i className="mp-blush mp-blush-r" />
                </div>
                <div className="mp-milim-hair-l" /><div className="mp-milim-hair-r" />
              </div>

              {/* Ground shadow */}
              <span className="mp-shadow" aria-hidden="true" />
            </div>
          </div>

          {/* ── Controls ────────────────────────────────────────────────── */}
          <div className="milim-pet-controls">
            <button
              type="button"
              className="milim-pet-btn"
              onClick={cycleSize}
              aria-label={`Resize Milim, currently ${prefs.size}`}
              title="Resize"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {prefs.size === "sm" ? "▂" : prefs.size === "md" ? "▅" : "█"}
            </button>
            <button
              type="button"
              className="milim-pet-btn"
              onClick={collapse}
              aria-label="Hide Milim companion"
              title="Hide"
              onPointerDown={(e) => e.stopPropagation()}
            >
              ×
            </button>
          </div>
        </>
      )}
    </div>
  );
}
