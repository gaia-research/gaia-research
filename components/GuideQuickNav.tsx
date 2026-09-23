"use client";

import { useEffect, useRef, useState } from "react";

const quickLinks = [
  { label: "Start here", href: "#start-here-the-short-version" },
  { label: "Choose a horizon", href: "#the-cache-horizon-decision-tree" },
  { label: "Run the workflow", href: "#step-0-first-decide-not-to-orchestrate" },
];

const moreGroups = [
  {
    label: "Provider setup",
    links: [
      { label: "Provider matrix", href: "#the-provider-cache-horizon-matrix" },
      { label: "Claude 1-hour setup", href: "#claude-configure-a-1-hour-root-cache" },
    ],
  },
  {
    label: "Workflow",
    links: [
      { label: "Worker manifests", href: "#step-5-make-workers-report-back-small-the-pointer-manifest" },
      { label: "Gap telemetry", href: "#step-6-look-at-the-bill-gap-telemetry" },
      { label: "Worked example", href: "#a-worked-example-start-to-finish" },
    ],
  },
  {
    label: "Review",
    links: [
      { label: "Common mistakes", href: "#mistakes-we-keep-making" },
      { label: "Evidence limits", href: "#what-is-unverified-here" },
      { label: "Benchmark method", href: "/research/context-compaction-phase-2" },
    ],
  },
];

export default function GuideQuickNav() {
  const moreRef = useRef<HTMLDetailsElement>(null);
  const [currentSection, setCurrentSection] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll<HTMLElement>(".report-body h2[id]"));
    if (!headings.length) return;

    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= 120);
        const active = passed[passed.length - 1] ?? headings[0];
        const next = { id: active.id, title: active.textContent?.trim() ?? active.id };
        setCurrentSection((previous) => previous?.id === next.id ? previous : next);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("hashchange", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const isActive = (href: string) => {
    const target = href.slice(1);
    if (target === "step-0-first-decide-not-to-orchestrate") {
      return currentSection ? /^step-[0-6]-/.test(currentSection.id) : false;
    }
    return currentSection?.id === target;
  };

  const closeMore = () => {
    if (moreRef.current) moreRef.current.open = false;
  };

  return (
    <nav className="guide-quick-nav" aria-label="Jump to a guide section">
      <span className="guide-quick-nav-label">Jump to</span>
      {quickLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          aria-current={isActive(link.href) ? "location" : undefined}
          onClick={closeMore}
        >
          {link.label}
        </a>
      ))}
      <details ref={moreRef} className="guide-quick-nav-more">
        <summary>More sections</summary>
        <div className="guide-quick-nav-more-links">
          {moreGroups.map((group) => (
            <div key={group.label} className="guide-quick-nav-group" role="group" aria-label={group.label}>
              <span className="guide-quick-nav-group-label">{group.label}</span>
              {group.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "location" : undefined}
                  onClick={closeMore}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </details>
      {currentSection ? (
        <span className="guide-quick-nav-current" title={currentSection.title}>
          <span className="sr-only">Current section: </span>{currentSection.title}
        </span>
      ) : null}
    </nav>
  );
}
