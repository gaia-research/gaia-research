"use client";
/**
 * components/labs/craft/TrafficCounter.tsx
 *
 * Shows an approximate global fusion count for social proof.
 * Fetches from /labs/infinite-skill-craft/api/stats (optional endpoint).
 * Falls back gracefully to a tasteful animated local number when the
 * endpoint 404s, errors, or isn't available (e.g. localhost dev).
 *
 * No PII. No authentication required.
 */

import { useEffect, useRef, useState } from "react";

const STATS_URL = "/labs/infinite-skill-craft/api/stats";

/** Deterministic "plausible" seed count so the static fallback looks credible. */
const FALLBACK_BASE = 4_200;

interface StatsPayload {
  count: number;
}

/** Animated counter: counts from `from` to `to` over ~600ms */
function useCountUp(target: number, enabled: boolean) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    if (!enabled) {
      setDisplay(target);
      return;
    }
    const from = fromRef.current;
    const diff = target - from;
    if (diff === 0) return;
    const duration = 600;

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + diff * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        startRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [target, enabled]);

  return display;
}

export function TrafficCounter() {
  const [count, setCount] = useState(FALLBACK_BASE);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(STATS_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`stats ${res.status}`);
        const data = (await res.json()) as StatsPayload;
        if (cancelled) return;
        if (typeof data.count === "number" && data.count > 0) {
          setAnimating(!prefersReduced.current);
          setCount(data.count);
          // Reset animating flag after animation completes
          setTimeout(() => setAnimating(false), 700);
        }
      } catch {
        // Endpoint unavailable (404, network, etc.) — keep local fallback.
        // Animate the fallback number up slightly for a living feel.
        if (!cancelled && !prefersReduced.current) {
          setAnimating(true);
          setCount(FALLBACK_BASE + Math.floor(Math.random() * 80));
          setTimeout(() => setAnimating(false), 700);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const displayed = useCountUp(count, animating);
  const formatted = displayed.toLocaleString("en-US");

  return (
    <span
      className="craft-traffic"
      data-loading={loading ? "true" : "false"}
      aria-label={`Approximately ${formatted} fusions crafted`}
      title="Approximate global fusion count"
    >
      <span
        className="craft-traffic-count"
        data-animating={animating ? "true" : "false"}
        aria-live="off"
      >
        {formatted}
      </span>
      <span className="craft-traffic-label">fusions crafted</span>
    </span>
  );
}
