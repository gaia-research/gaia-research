"use client";
/**
 * components/labs/craft/MilimDragon.tsx
 *
 * CSS-only animated mascot pinned to the bottom-right corner of the lab.
 * No image files. Built from divs + CSS @keyframes.
 *
 * Milim energy: playful demon-lord, floats & blinks idle.
 * Sparks on fusion events (listens to window 'isc:fused' custom event).
 * Dismissible/collapsible via a small toggle button.
 * Respects prefers-reduced-motion (static pose, no animations).
 *
 * Styles live in craft-chrome.css.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export function MilimDragon() {
  const [collapsed, setCollapsed] = useState(false);
  const [sparking, setSparking] = useState(false);
  // "celebrate" is the louder reaction reserved for canonical unlocks and
  // first discoveries — the dragon does a bigger bounce + a ⭐ spark.
  const [celebrate, setCelebrate] = useState(false);
  const sparkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for fusion events dispatched by CraftCanvas
  useEffect(() => {
    const onFused = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { canonical?: boolean; firstDiscovery?: boolean; builderUnlock?: boolean }
        | undefined;
      // A brand-new builder unlock is the loudest moment — always a big celebrate.
      const big = !!(detail?.canonical || detail?.firstDiscovery || detail?.builderUnlock);
      const huge = !!detail?.builderUnlock;
      setSparking(true);
      setCelebrate(big);
      if (sparkTimer.current) clearTimeout(sparkTimer.current);
      sparkTimer.current = setTimeout(() => {
        setSparking(false);
        setCelebrate(false);
      }, huge ? 1400 : big ? 1100 : 900);
    };
    window.addEventListener("isc:fused", onFused);
    return () => {
      window.removeEventListener("isc:fused", onFused);
      if (sparkTimer.current) clearTimeout(sparkTimer.current);
    };
  }, []);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <div className="craft-dragon-wrap" aria-label="Milim mascot">
      {/* Dragon body */}
      <div
        className="craft-dragon"
        data-hidden={collapsed ? "true" : "false"}
        data-sparking={sparking ? "true" : "false"}
        data-celebrate={celebrate ? "true" : "false"}
        role="img"
        aria-label="Milim the dragon mascot"
      >
        <div className="craft-dragon-body">
          {/* Spark (on fusion) */}
          <span
            className="craft-dragon-spark"
            aria-hidden="true"
            data-show={sparking ? "true" : "false"}
          >
            {celebrate ? "⭐" : "✦"}
          </span>

          {/* Head */}
          <div className="craft-dragon-head" aria-hidden="true">
            <div className="craft-dragon-horn-l" />
            <div className="craft-dragon-horn-r" />
          </div>

          {/* Wings */}
          <div className="craft-dragon-wing-l" aria-hidden="true" />
          <div className="craft-dragon-wing-r" aria-hidden="true" />

          {/* Torso */}
          <div className="craft-dragon-torso" aria-hidden="true" />

          {/* Tail */}
          <div className="craft-dragon-tail" aria-hidden="true" />
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        className="craft-dragon-toggle"
        onClick={toggle}
        aria-label={collapsed ? "Show Milim mascot" : "Hide Milim mascot"}
        title={collapsed ? "Show mascot" : "Hide mascot"}
      >
        {collapsed ? "🐉" : "×"}
      </button>
    </div>
  );
}
