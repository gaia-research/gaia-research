// Static privacy note. Not "use client" — no interactivity; it renders on the
// server as part of the analyzer surface. Wording satisfies Issue #16 task 5.

import { InfoTip } from "./InfoTip";

export function PrivacyNote() {
  return (
    <p className="privacy-note" role="note">
      <strong>Private by design.</strong> Your context is never sent to the leaderboard.
      <InfoTip label="How Context Diet protects your context">
        Pasted text stays in your browser. For a public GitHub link, the server retrieves only the
        repository listing and file you choose. Sharing aggregate token metrics is always opt-in.
      </InfoTip>
    </p>
  );
}
