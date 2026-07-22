// Static privacy note. Not "use client" — no interactivity; it renders on the
// server as part of the analyzer surface. Wording satisfies Issue #16 task 5.

export function PrivacyNote() {
  return (
    <p className="privacy-note" role="note">
      <strong>Private by design.</strong> Analysis runs in your browser. Pasted text never leaves
      it; for a public GitHub link, the server retrieves only the bounded repository listing and
      file you choose. File contents are never sent to the leaderboard. Only aggregate metrics
      (token counts and reduction %) are submitted, and only if you opt in below.
    </p>
  );
}
