"use client";
/**
 * components/labs/craft/CraftChromeBar.tsx
 *
 * The chrome toolbar between the hero and the CraftCanvas.
 * Holds the '?' (onboarding re-open) and 'About' trigger buttons,
 * plus the TrafficCounter for social proof.
 *
 * The OnboardingModal auto-opens on first visit via its own localStorage
 * check; this bar provides the re-open control for returning users.
 */

import { useState } from "react";
import { OnboardingModal } from "./OnboardingModal";
import { AboutModal } from "./AboutModal";
import { TrafficCounter } from "./TrafficCounter";

export function CraftChromeBar() {
  // Each modal has its own open state; OnboardingModal handles its own
  // first-visit auto-open internally when open===undefined.
  const [onboardingOpen, setOnboardingOpen] = useState<boolean | undefined>(undefined);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      {/* The toolbar — sits between hero and canvas */}
      <div className="craft-chrome-bar" role="toolbar" aria-label="Lab controls">
        <TrafficCounter />

        <div className="craft-chrome-actions">
          <button
            type="button"
            className="craft-chrome-btn craft-chrome-btn-help"
            onClick={() => setOnboardingOpen(true)}
            aria-label="Show welcome guide — what is a skill?"
            title="What is a skill? (welcome guide)"
          >
            <span aria-hidden="true">?</span> What&apos;s a skill
          </button>

          <button
            type="button"
            className="craft-chrome-btn"
            onClick={() => setAboutOpen(true)}
            aria-label="About this lab and credits"
          >
            About
          </button>
        </div>
      </div>

      {/*
        OnboardingModal:
        - When onboardingOpen is `undefined`, the modal governs itself
          (auto-opens on first visit via localStorage).
        - When set to `true` (button click), it's forced open as a
          controlled re-open.
        - onClose resets back to undefined so subsequent visits still
          auto-trigger if the user clears storage.
      */}
      <OnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(undefined)}
      />

      <AboutModal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </>
  );
}
