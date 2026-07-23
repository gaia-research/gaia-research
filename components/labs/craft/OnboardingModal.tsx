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
            Drag AI agent skills together on the canvas — fuse any two to see what hatches, boss.
          </p>

          {/* Anti-confusion shield — what an agent skill actually IS */}
          <div className="craft-skill-callout" role="note">
            <p className="craft-skill-callout-text">
              <strong>
                <CraftTooltip content="A SKILL.md instruction set that gives an AI agent a named ability — not random vibes, but a usable, verifiable capability." ariaLabel="What is an agent skill?">
                  🔑 Agent skill
                </CraftTooltip>
              </strong>{" "}
              = a packaged capability spec. <code>/prompt</code>, <code>/code</code>, <code>/web</code> are skills.
            </p>
          </div>

          {/* Three-step explainer */}
          <div className="craft-onboard-steps" role="list">
            <div className="craft-onboard-step" role="listitem">
              <span className="craft-onboard-step-emoji" aria-hidden="true">🃏</span>
              <div className="craft-onboard-step-text">
                <span className="craft-onboard-step-title">1 · Click a skill to drop it</span>
              </div>
            </div>

            <div className="craft-onboard-step" role="listitem">
              <span className="craft-onboard-step-emoji" aria-hidden="true">⚗️</span>
              <div className="craft-onboard-step-text">
                <span className="craft-onboard-step-title">2 · Drag two together to fuse</span>
              </div>
            </div>

            <div className="craft-onboard-step" role="listitem">
              <span className="craft-onboard-step-emoji" aria-hidden="true">🌳</span>
              <div className="craft-onboard-step-text">
                <span className="craft-onboard-step-title">3 · Collect all {BUILDERS_TOTAL} builder cards ✦</span>
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
