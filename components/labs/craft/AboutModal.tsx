"use client";
/**
 * components/labs/craft/AboutModal.tsx
 *
 * Homage & credits modal for Infinite Skill Craft (Lab 002).
 *
 * MANDATORY: Neal Agarwal attribution appears above the fold,
 * states this is an original homage (not a fork), links CREDITS.md concept,
 * and credits the Gaia Skill Tree.
 *
 * Triggered from outside via the 'open' prop (wired to the About button
 * in CraftChromeBar). Dismissible via × button, backdrop click, or Escape.
 * Focus-trapped while open.
 */

import { useCallback, useEffect, useRef } from "react";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLAnchorElement>(null);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus management
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => {
      firstFocusRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      prev?.focus?.();
    };
  }, [open]);

  const trapTab = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const first = firstFocusRef.current;
    const last = lastFocusRef.current;
    if (!first || !last) return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="craft-modal-backdrop"
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label="About Infinite Skill Craft"
      onKeyDown={trapTab}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="craft-modal" role="document">
        <header className="craft-modal-head">
          <div>
            <p className="craft-modal-kicker">Lab 002 · Credits</p>
            <h2 className="craft-modal-title">About</h2>
          </div>
          <button
            ref={firstFocusRef}
            type="button"
            className="craft-modal-close"
            onClick={onClose}
            aria-label="Close about panel"
          >
            ×
          </button>
        </header>

        <div className="craft-modal-body">
          {/* ── ATTRIBUTION — above the fold, mandatory ──────────────────── */}
          <div className="craft-about-attribution" role="note" aria-label="Attribution">
            <p>
              <strong>Inspired by Infinite Craft by Neal Agarwal.</strong>{" "}
              Every line of code in this lab is original — this is a homage, not a fork.
              The soul of the mechanic (drag two things together, discover what appears,
              wonder what&apos;s next) belongs to Neal. If you haven&apos;t played the
              original yet, go play it:{" "}
              <a
                href="https://neal.fun/infinite-craft/"
                target="_blank"
                rel="noreferrer noopener"
              >
                neal.fun/infinite-craft
              </a>
              . We&apos;ll wait.
            </p>
            <p>
              Same-day takedown policy: if Neal ever asks us to take this down, we will.
              No questions, no drama. His work inspired this; his wishes take priority.
            </p>
          </div>

          {/* ── What makes this different ────────────────────────────────── */}
          <p>
            Infinite Skill Craft re-imagines the fusion mechanic around{" "}
            <strong>AI agent skills</strong> — packaged capabilities from the{" "}
            <a href="https://gaiaskilltree.com" target="_blank" rel="noreferrer noopener">
              Gaia Skill Tree
            </a>
            . Canonical fusions surface real, spec&apos;d abilities you can actually use in your
            agent stack. Experimental results are the frontier — you judge whether they belong.
          </p>

          {/* ── Credit grid ──────────────────────────────────────────────── */}
          <div className="craft-credits-grid" role="list">
            <div className="craft-credit-item" role="listitem">
              <span className="craft-credit-icon" aria-hidden="true">✨</span>
              <p className="craft-credit-text">
                <strong>Conceptual ancestor</strong>
                Infinite Craft by{" "}
                <a
                  href="https://neal.fun/infinite-craft/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Neal Agarwal
                </a>{" "}
                — the draggable fusion idea that started it all.
              </p>
            </div>

            <div className="craft-credit-item" role="listitem">
              <span className="craft-credit-icon" aria-hidden="true">🌳</span>
              <p className="craft-credit-text">
                <strong>Canonical skills</strong>
                The{" "}
                <a href="https://gaiaskilltree.com" target="_blank" rel="noreferrer noopener">
                  Gaia Skill Tree
                </a>{" "}
                and its contributors — canonical fusion results link directly to the real skill
                specs they wrote.
              </p>
            </div>

            <div className="craft-credit-item" role="listitem">
              <span className="craft-credit-icon" aria-hidden="true">⚡</span>
              <p className="craft-credit-text">
                <strong>Built with pi</strong>
                Bootstrapped and iterated with the{" "}
                <a
                  href="https://github.com/earendil-works/pi"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  pi coding agent
                </a>{" "}
                harness, while Milim was busy being aggressively excited about skill combos.
              </p>
            </div>

            <div className="craft-credit-item" role="listitem">
              <span className="craft-credit-icon" aria-hidden="true">🔬</span>
              <p className="craft-credit-text">
                <strong>Gaia Research Team</strong>
                Built with curiosity and an unhealthy love of skill taxonomies.
                Milim Nova approves.
              </p>
            </div>
          </div>

          <p>
            <em style={{ fontStyle: "normal", color: "var(--dim)" }}>
              &ldquo;We made it because it&apos;s fun. We credit Neal because it&apos;s right.&rdquo;
            </em>
          </p>

          {/* Accessible last-focus anchor */}
          <a
            ref={lastFocusRef}
            href="https://neal.fun/infinite-craft/"
            target="_blank"
            rel="noreferrer noopener"
            style={{ fontSize: "0.8rem", color: "var(--dim)", alignSelf: "flex-start" }}
          >
            neal.fun/infinite-craft ↗
          </a>
        </div>
      </div>
    </div>
  );
}
