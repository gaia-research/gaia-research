"use client";
/**
 * components/labs/craft/ContributorCollection.tsx
 *
 * The "Builders" collection — a contributor Pokédex for Infinite Skill Craft.
 *
 * Every canonical skill in this lab was authored by a REAL Gaia Skill Tree
 * builder (@garrytan, @mattpocock, @karpathy, @addy-osmani, @ruvnet, @obra,
 * @huggingface, @anthropic…). Unlock a skill from one of them for the first time
 * and you COLLECT that builder. This modal is the trophy case: a status/roster
 * board where unlocked builders glow Milim-pink and locked ones sit as ghosted
 * silhouettes that tease the biggest names ("🔒 ??? — has 48 skills to discover").
 *
 * Design register: identity-preserving enhancement of the existing craft modal
 * system (AboutModal / OnboardingModal). Reuses ONLY the shipped tokens — obsidian
 * --bg / --surface, --pink, --blue, --amber, and the Bebas/Syne/Manrope/DM Mono
 * stacks. No new colors, no globals.css edits; all styles live in craft-chrome.css.
 *
 * A11y: role="dialog" + aria-modal, focus trap, Escape to close, backdrop click to
 * dismiss, contrast ≥ 4.5:1, reduced-motion friendly.
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  allContributors,
  contributorProfileUrl,
  type Contributor,
} from "@/lib/craft/contributors";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Per-builder unlock state kept by CraftCanvas (localStorage `gaia.craft.builders.v1`). */
export interface UnlockedBuilder {
  /** Unix-ms of the first canonical skill discovered from this builder. */
  firstAt: number;
  /** How many DISTINCT canonical skills the player has found from this builder. */
  found: number;
}

interface ContributorCollectionProps {
  open: boolean;
  onClose: () => void;
  /** handle -> unlock state. Empty until the first canonical builder is collected. */
  unlocked: Record<string, UnlockedBuilder>;
}

// ---------------------------------------------------------------------------
// Derived chip model — unlocked first (by discovered count desc), then locked
// (by available count desc, so the prolific builders tease early).
// ---------------------------------------------------------------------------

interface Chip extends Contributor {
  isUnlocked: boolean;
  /** Distinct skills the player has found from this builder (0 when locked). */
  found: number;
  /** When first collected (for a subtle "just found" flourish ordering). */
  firstAt: number;
}

function buildChips(
  roster: Contributor[],
  unlocked: Record<string, UnlockedBuilder>,
): Chip[] {
  const chips: Chip[] = roster.map((c) => {
    const u = unlocked[c.handle];
    return {
      ...c,
      isUnlocked: !!u,
      found: u ? Math.min(u.found, c.count) : 0,
      firstAt: u ? u.firstAt : 0,
    };
  });

  return chips.sort((a, b) => {
    // 1. Unlocked builders always sort ahead of locked ones.
    if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
    if (a.isUnlocked && b.isUnlocked) {
      // 2a. Unlocked: most-discovered first, then by their total, then handle.
      return (
        b.found - a.found ||
        b.count - a.count ||
        a.handle.localeCompare(b.handle)
      );
    }
    // 2b. Locked: bait the big names — most available skills first.
    return b.count - a.count || a.handle.localeCompare(b.handle);
  });
}

/** A tiny star flourish scaling with how many of a builder's skills you've found. */
function stars(found: number): string {
  if (found >= 5) return "★★★";
  if (found >= 3) return "★★";
  if (found >= 1) return "★";
  return "";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContributorCollection({
  open,
  onClose,
  unlocked,
}: ContributorCollectionProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const roster = useMemo(() => allContributors(), []);
  const total = roster.length;
  const unlockedCount = useMemo(
    // Count only handles that are real roster members (tolerate stale keys).
    () => roster.filter((c) => unlocked[c.handle]).length,
    [roster, unlocked],
  );
  const chips = useMemo(() => buildChips(roster, unlocked), [roster, unlocked]);
  const pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus management — land on close, restore on unmount.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      prev?.focus?.();
    };
  }, [open]);

  // Focus trap across every focusable node inside the modal.
  const trapTab = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusable = backdropRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="craft-modal-backdrop"
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label="Builders collection"
      onKeyDown={trapTab}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="craft-modal craft-builders" role="document">
        <header className="craft-modal-head">
          <div>
            <p className="craft-modal-kicker">Lab 002 · Collection</p>
            <h2 className="craft-modal-title">
              Builders discovered — {unlockedCount}
              <span className="craft-builders-of"> / {total}</span>
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="craft-modal-close"
            onClick={onClose}
            aria-label="Close Builders collection"
          >
            ×
          </button>
        </header>

        <div className="craft-modal-body craft-builders-body">
          <p className="craft-builders-intro">
            Every real skill has a builder behind it. Unlock a canonical skill from a
            Gaia Skill Tree contributor for the first time and you <strong>collect</strong>{" "}
            them, boss. Collect all {total}.
          </p>

          {/* Progress bar — subtle, pink fill on a Rimuru-blue track. */}
          <div className="craft-builders-progress">
            <div
              className="craft-builders-bar"
              role="progressbar"
              aria-valuenow={unlockedCount}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-label={`${unlockedCount} of ${total} builders discovered`}
            >
              <span
                className="craft-builders-bar-fill"
                style={{ width: `${pct}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="craft-builders-pct" aria-hidden="true">
              {pct}%
            </span>
          </div>

          {/* Roster grid. */}
          <ul className="craft-builders-grid" aria-label={`${total} builders`}>
            {chips.map((chip) =>
              chip.isUnlocked ? (
                <li
                  key={chip.handle}
                  className="craft-builder is-found"
                >
                  <div className="craft-builder-top">
                    <span className="craft-builder-handle">@{chip.handle}</span>
                    {stars(chip.found) && (
                      <span
                        className="craft-builder-stars"
                        aria-label={`${chip.found} skills found`}
                        title={`${chip.found} skills found`}
                      >
                        {stars(chip.found)}
                      </span>
                    )}
                  </div>
                  <p className="craft-builder-meta">
                    <b>{chip.found}</b> skill{chip.found === 1 ? "" : "s"} found{" "}
                    <span className="craft-builder-of">of {chip.count}</span>
                  </p>
                  <a
                    className="craft-builder-link"
                    href={contributorProfileUrl(chip.handle)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    View on Skill Tree <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ) : (
                <li
                  key={chip.handle}
                  className="craft-builder is-locked"
                  aria-label={`Locked builder — has ${chip.count} skills to discover`}
                >
                  <div className="craft-builder-top">
                    <span className="craft-builder-handle is-silhouette" aria-hidden="true">
                      🔒 ???
                    </span>
                  </div>
                  <p className="craft-builder-meta">
                    has <b>{chip.count}</b> skill{chip.count === 1 ? "" : "s"} to discover
                  </p>
                  <p className="craft-builder-teaser" aria-hidden="true">
                    Fuse a real skill of theirs to reveal the name.
                  </p>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
