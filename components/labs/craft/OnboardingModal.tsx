"use client";
/**
 * components/labs/craft/OnboardingModal.tsx
 *
 * First-visit onboarding modal for Infinite Skill Craft (Lab 002).
 *
 * Purpose: The ANTI-CONFUSION SHIELD. A user who walks away not knowing
 * that what they crafted is an *agent skill* (a packaged capability /
 * SKILL.md instruction set) is a lose condition for this whole lab.
 * This modal exists to prevent that — with warmth, brevity, and Milim voice.
 *
 * Behaviour:
 *  - Auto-opens on first visit (localStorage key 'isc-onboarded' absent).
 *  - Dismissible with the × button, the Start button, or pressing Escape.
 *  - Re-openable externally by passing open=true from a parent component.
 *  - Focus-trapped inside while open.
 *  - Respects prefers-reduced-motion.
 *
 * Usage:
 *   // Standalone (auto-open on first visit only):
 *   <OnboardingModal />
 *
 *   // Controlled (re-open from a button):
 *   <OnboardingModal open={open} onClose={() => setOpen(false)} />
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { allContributors } from "@/lib/craft/contributors";
import { CraftTooltip } from "./CraftTooltip";

export const ONBOARD_STORAGE_KEY = "isc-onboarded";

/** Total collectable builders — shown in the onboarding nudge. */
const BUILDERS_TOTAL = allContributors().length;

interface OnboardingModalProps {
  /** When provided, overrides the auto-open logic (open=true forces open). */
  open?: boolean;
  onClose?: () => void;
}

export function OnboardingModal({ open: externalOpen, onClose }: OnboardingModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Auto-open on first visit (uncontrolled path — only when no external prop)
  useEffect(() => {
    if (externalOpen !== undefined) return;
    try {
      const done = window.localStorage.getItem(ONBOARD_STORAGE_KEY);
      if (!done) setInternalOpen(true);
    } catch {
      // Private mode / quota error — show it anyway
      setInternalOpen(true);
    }
  }, [externalOpen]);

  const visible = externalOpen !== undefined ? externalOpen : internalOpen;

  const close = useCallback(() => {
    setInternalOpen(false);
    try {
      window.localStorage.setItem(ONBOARD_STORAGE_KEY, "1");
    } catch { /* ignore */ }
    onClose?.();
  }, [onClose]);

  // Escape key
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, close]);

  // Focus management
  useEffect(() => {
    if (!visible) return;
    const prev = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => {
      closeRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      prev?.focus?.();
    };
  }, [visible]);

  // Focus trap
  const trapTab = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusable = backdropRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
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

  if (!visible) return null;

  return (
    <div
      className="craft-modal-backdrop"
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Infinite Skill Craft"
      onKeyDown={trapTab}
      onClick={(e) => { if (e.target === backdropRef.current) close(); }}
    >
      <div className="craft-modal" role="document">
        <header className="craft-modal-head">
          <div>
            <p className="craft-modal-kicker">Lab 002 · Welcome</p>
            <h2 className="craft-modal-title">What is this?</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="craft-modal-close"
            onClick={close}
            aria-label="Close welcome guide"
          >
            ×
          </button>
        </header>

        <div className="craft-modal-body">
          <p className="craft-modal-lead">
            Combine AI agent skills on a free-floating canvas to discover what emerges, boss!
          </p>

          {/* Anti-confusion shield — what an agent skill actually IS */}
          <div className="craft-skill-callout" role="note">
            <p className="craft-skill-callout-text">
              <strong>🔑 What is a skill?</strong> An agent skill is a packaged capability (<code>SKILL.md</code>){" "}
              that gives an AI agent a named ability like <code>/prompt</code> or <code>/code</code>.
              <CraftTooltip content="Skills are instruction-first building blocks that define actions an agent can perform, tools it wields, or context it understands — not random vibes, but usable abilities." ariaLabel="More details about agent skills">
                <span className="craft-tooltip-badge">ⓘ Details</span>
              </CraftTooltip>
            </p>
          </div>

          {/* Three-step explainer */}
          <div className="craft-onboard-steps" role="list">
            <div className="craft-onboard-step" role="listitem">
              <span className="craft-onboard-step-emoji" aria-hidden="true">🃏</span>
              <div className="craft-onboard-step-text">
                <span className="craft-onboard-step-title">1 · Drop skills on canvas</span>
                <p className="craft-onboard-step-desc">
                  Click inventory skills to place them on the canvas. Start with <strong>/prompt</strong>, <strong>/code</strong>, <strong>/web</strong>, or <strong>/data</strong>.
                </p>
              </div>
            </div>

            <div className="craft-onboard-step" role="listitem">
              <span className="craft-onboard-step-emoji" aria-hidden="true">⚗️</span>
              <div className="craft-onboard-step-text">
                <span className="craft-onboard-step-title">2 · Drag together to fuse</span>
                <p className="craft-onboard-step-desc">
                  Overlap two skills to fuse them into a new creation. Discover{" "}
                  <strong>
                    Canonical ✦
                    <CraftTooltip content="Verified skills in the Gaia Skill Tree registry. Tap their result card to open their live spec page!" ariaLabel="Info about canonical results">
                      <span className="craft-tooltip-icon">ⓘ</span>
                    </CraftTooltip>
                  </strong>{" "}
                  or{" "}
                  <strong>
                    Experimental 🧪
                    <CraftTooltip content="AI-invented combinations generated on the fly. Plausible capability ideas for you to judge, boss!" ariaLabel="Info about experimental results">
                      <span className="craft-tooltip-icon">ⓘ</span>
                    </CraftTooltip>
                  </strong>{" "}
                  results.
                </p>
              </div>
            </div>

            <div className="craft-onboard-step" role="listitem">
              <span className="craft-onboard-step-emoji" aria-hidden="true">🌳</span>
              <div className="craft-onboard-step-text">
                <span className="craft-onboard-step-title">3 · Grow your skill tree</span>
                <p className="craft-onboard-step-desc">
                  Discoveries join your inventory for future fusions. Discover canonical skills to collect{" "}
                  <strong>
                    all {BUILDERS_TOTAL} builder cards
                    <CraftTooltip content="Every real skill has an open-source contributor behind it. Discover canonical skills to collect their badges!" ariaLabel="Info about builder collection">
                      <span className="craft-tooltip-icon">ⓘ</span>
                    </CraftTooltip>
                  </strong>.
                </p>
              </div>
            </div>
          </div>

          <button
            ref={ctaRef}
            type="button"
            className="craft-modal-cta"
            onClick={close}
          >
            Start crafting, boss <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
