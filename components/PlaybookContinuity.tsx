"use client";

import { useEffect, useRef, useState } from "react";

export interface ContinuityItem {
  ask: string;
  src: string;
}

// Hero hook for /research/agent-playbook: the same recurring questions, one per
// fresh session. Flip to "with the playbook" and each one resolves to the file
// that answers it. The full answers live in section 01 below.
export default function PlaybookContinuity({ items }: { items: readonly ContinuityItem[] }) {
  const [withPlaybook, setWithPlaybook] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const touched = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (reduce || !el || typeof IntersectionObserver === "undefined") return;
    setWithPlaybook(false);
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        timer = window.setTimeout(() => {
          if (!touched.current) setWithPlaybook(true);
        }, 1600);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const pick = (v: boolean) => {
    touched.current = true;
    setWithPlaybook(v);
  };

  return (
    <figure ref={ref} className="apc" data-with={withPlaybook} aria-labelledby="apc-cap">
      <div className="apc-head">
        <figcaption id="apc-cap">Every fresh session</figcaption>
        <div className="apc-toggle" role="group" aria-label="Compare sessions">
          <button type="button" aria-pressed={!withPlaybook} onClick={() => pick(false)}>
            Fresh agent
          </button>
          <button type="button" aria-pressed={withPlaybook} onClick={() => pick(true)}>
            With the playbook
          </button>
        </div>
      </div>
      <ol className="apc-list" aria-live="polite">
        {items.map((item, i) => (
          <li key={item.ask} style={{ ["--i" as string]: i }}>
            <span className="apc-session">S{i + 1}</span>
            <span className="apc-ask">{item.ask}</span>
            <span className="apc-state">
              {withPlaybook ? (
                <>
                  <b aria-hidden="true">✓</b> {item.src}
                </>
              ) : (
                <>
                  <b aria-hidden="true">?</b> Asks you again
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
